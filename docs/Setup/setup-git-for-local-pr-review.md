# Setup Git for local PR review

#git #review #setup

Fetch the PRs via ./.git/config update:

```text
   fetch = +refs/pull/*/head:refs/pulls/origin/pr/*
```


```text
[remote "origin"]  
	url = git@github.com:wtasg/meetonline.git  
	fetch = +refs/heads/*:refs/remotes/origin/*  
	fetch = +refs/pull/*/head:refs/pulls/origin/pr/*
```


And the just do `git fetch --all`.
