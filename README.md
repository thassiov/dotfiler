<div align="center">
  <img src="dotfiler-logo.png">
  <h5>everything in the right place</h5>
</div>

# dotfiler

## Install

```
$ npm install -G dotfiler

```

Or you can download the executable and place it in your $PATH. As of right now, the executable only works in Linux.


## What it does

It makes sure your configs are in the correct place. By having a list of the files and where they should be placed, _dotfiler_ makes sure everything is in the correct place so you don't have to check file by file.

It creates symlinks of files and/or directories by default, but it also can make full copies of them.

## How it works

This tool looks for your `$HOME/.dotfiles` **directory**, by default. Once there, it tries to read a yaml (or json) file called `.dotfiler`. This file should have all your file mappings.
After your config in place, you run `dotfiler`:

```
$ dotfiler
```

> example gif

## `.dotfiler`

Right now this file has a simple structure: a `configs` prop as an array where each element corresponds to a file or directory.

It should look like this:

```yaml
---
configs:
- src: i3
  dest: "~/.configs/i3"
- src: tmux.conf
  dest: "~/.tmux.conf"
```

### `src`

The name of your file or directory. It must not have any path delimiter **before** the name (like `./` or `..`) as the as the application will try to attach the current directory's path to it.

### `dest`

Where the contents of `src` should be placed at. The path must be absolute, but it supports `~` to represent your home directory.

### `copy` (optional)

If this property is set to `true`, _dotfiler_ will try to copy the file or directory instead of creating a symlink.

## Alternative path for your configs

_dotfiler_ *looks first* for the file `$HOME/.dotfiler` to know where the configs are. If this file is not found, it falls back to the `$HOME/.dotfiles` directory. Note that in the `$HOME/.dotfiler` file you can put multiple directories containing configs to be used.

### `$HOME/.dotfiler`

This file has a simple structure: a `dotfiles` prop as an array where each element corresponds to a project/directory containing configurations to map.

It should look like this:

```yaml
---
dotfiles:
- name: "main configs"
  location: "~/.dotfiles-main"
- name: "work related dotfiles"
  location: "~/dev/work"
```

### `name` (optional)

This property only purpose right now is to help identify the directory. Not used internaly right now.

### `location`

The location of your dotfiles. Differently from `$HOME/.dotfiles`, this directory can be named whatever you want.

## Tree view

```
$HOME
├── .bash_history
├── .bash_logout
├── .bashrc
├── **.dotfiler** (optional)
├── **.dotfiles** (default directory)
│   ├── .conkyrc
│   ├── **.dotfiler** (required)
│   ├── .gitconfig
│   ├── .gitignore
│   ├── .zshrc
│   ├── compton.conf
│   ├── i3
│   ├── termite
│   └── tmux.conft
└── .viminfo

```

## Developing this thing

`docker-compose up --build` will start the development container. It runs with nodemon and everytime the code changes, the environment is cleaned up and the files/directories are recreated.

## License
[MIT](LICENSE)

