<div align="center">
  <img src="dotfiler-logo.png">
  <h5>keeps track</h5>
</div>

# dotfiler

## What it does

It makes sure your configs are in the correct place. By having a list of the files and where they should be placed, _dotfiler_ makes sure everything is in the correct place so you don't have to check file by file.

It creates symlinks of files and/or directories by default, but it also can make full copies of them.

## How it works

_dotfiler_ looks for your `$HOME/dotfiles` directory, by default. Alternatively, you can point _dotfiler_ in the right direction by [using a config file](#looking-for-directories), but this is optional.
In your dotfiles directory, _dotfiler_ will try to read the `.dotfiler.json` file. This is where you will list all the files and directories you wish _dotfiler_ to work with.

It should look like this:

```json
{
  "configs": [
    {
      "src":"first.conf",
      "dest":"~/first.conf"
    },
    {
      "src":"conf-directory",
      "dest":"/dest-dir/conf-directory"
    },
    {
      "src":"second.conf",
      "dest":"/dest-dir/second.conf",
      "copy": true
    },
    {
      "src":"conf-directory-copy",
      "dest":"~/conf-directory-copy",
      "copy": true
    },
  ...,
  ]
}
```

### Looking for directories

_dotfiler_ *looks first* for the file `$HOME/.dotfiler.json` to know where the configs are. If this file is not found, it falls back to the `$HOME/dotfiles` directory. Note that in the `$HOME/.dotfiler.json` file you can put multiple directories containing configs to be used.

## .dotfiler.json

The default name for this configuration is `.dotfiler.json`, but can be named whatever you want if you describe it at the `$HOME/.dotfiler.json` file.

Right now this json has a simple structure: a `configs` prop as an array where each element corresponds to a file or directory.

### `src`

The name of your file or directory. It must not have any path delimiter before the name (like `./` or `..`) as the as the application will try to attach the current directory's path to it.

### `dest`

Where the contents of `src` should be placed at. In case of a file, the path must include its name.

The path must be absolute, but it supports `~` to represent yout home directory.

### `copy` (optional)

If this property is set to `true`, _dotfiler_ will try to copy the file or directory instead of creating a symlink.

## Developing this thing

`docker-compose up --build` will start the development container. It runs with nodemon and everytime the code changes, the environment is cleaned up and the files/directories are recreated.

## License
[MIT](LICENSE)

