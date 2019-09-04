# IssueChecker
Automatically close issues whose title match the specified regex.

# Changes
*This is a modified version of https://github.com/roots/issue-closer-action.*

For my use case I needed the application to check the issue title.
I need it to prevent issue spam from a site which follows a certain format.


## Installation

To configure the action simply add the following lines to your `.github/main.workflow` workflow file:

```yml
name: Autocloser
on: [issues]
jobs:
  autoclose:
    runs-on: ubuntu-latest
    steps:
    - name: Autoclose issues whose title matched the specified regex
      uses: IndyV/issue-closer@v1.0
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        issue-close-message: "@${issue.user.login} this issue was automatically closed because it matched a spam regex"
        issue-pattern: ".*guidelines for Contributing.*"
```

## Configuration

`issue-close-message` is an ES6-style template literal which will be evaluated with the issue
webhook payload in context. The example above uses `${issue.user.login}` to get the author of the issue.

* `issue` webhook [payload example](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-15)

`issue-pattern` is a string which is compiled to JavaScript `Regexp`s.