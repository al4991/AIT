# Homework 04

## Links 

Using [GitHub's documentation for linking to code](https://help.github.com/en/articles/creating-a-permanent-link-to-a-code-snippet), add links to:

* the part of your code that instantiates the `FileSystem` class with an object (from parsed JSON) being used to bootstrap it with some initial virtual file system data
* one example of using the instance of `FileSystem` to provide the data needed to fulfill a request... 
	* __example__: if there's a `POST` to `vfs` with `ls` as the form input
	* show the part of your code where a method is called on your instance of `FileSystem` 
	* ...that gives back a list of files that are eventually put into a rendered template
