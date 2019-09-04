import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const issueCloseMessage: string = core.getInput('issue-close-message');

    if (!issueCloseMessage) {
      throw new Error('Action must have an issue-close-message ');
    }

    const issuePattern: string = core.getInput('issue-pattern');

    if (!issuePattern) {
      throw new Error('Action must have an issue-pattern set');
    }

    // Get client and context
    const client: github.GitHub = new github.GitHub(
      core.getInput('repo-token', {required: true})
    );
    const context = github.context;
    const payload = context.payload;

    if (payload.action !== 'opened') {
      core.debug('No issue was opened, skipping');
      return;
    }

    if (!payload.issue) {
      core.debug(
        'The event that triggered this action was not an issue, skipping.'
      );
      return;
    }

    if (!payload.sender) {
      throw new Error('Internal error, no sender provided by GitHub');
    }

    const issue: {owner: string; repo: string; number: number} = context.issue;
    const pattern: RegExp = new RegExp(issuePattern);
    const title: string | undefined = getTitle(payload);

    core.debug(`Matching against pattern ${pattern}`);
    if (title && title.match(pattern)) {
      core.debug('Title matched.');
    } else {
      core.debug('Title did not match. Nothing more to do.');
      return;
    }

    core.debug('Creating message from template');
    const message: string = evalTemplate(issueCloseMessage, payload);

    // Add a comment to the appropriate place
    core.debug(`Adding message: ${message} to issue ${issue.number}`);
    await client.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: message
    });
    core.debug('Closing issue');
    await client.issues.update({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      state: 'closed'
    });
  } catch (error) {
    core.setFailed(error.message);
    return;
  }
}

function getTitle(payload): string | undefined {
  if (payload.issue && payload.issue.title) {
    return payload.issue.title;
  }
}

function evalTemplate(template, params) {
  return Function(...Object.keys(params), `return \`${template}\``)(
    ...Object.values(params)
  );
}

run();
