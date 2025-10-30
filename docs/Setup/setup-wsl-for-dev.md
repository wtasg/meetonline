# Setting up WSL2 for development

- Use WSL2
- `wsl.exe --install debian`
- `debian` : Run the debian app
- `sudo apt update && sudo apt upgrade --yes`
- `sudo apt install --yes vim curl git wget nmap docker tmux`
- `ssh-keygen -t ed25519`
- `cat ~/.ssh/id_ed25519.pub` # put this in github ssh keys
- `eval "$(ssh-agent -s)"` # Everytime the
- `ssh-add -t 864000 ~/.ssh/id_ed25519`
- `ssh -T git@github.com`
- Install WSL in vscode
- Clone this repo via SSH url in debian in `/home/<USER>/src/` directory
- Open the repo in vscode via WSL (wsl via disro, choose debian)

## Setup obsidian

```bash
sudo apt install flatpak
sudo service dbus start
sudo apt install gnome-software-plugin-flatpak
sudo apt install plasma-discover-backend-flatpak
# reboot
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo flatpak install flathub md.obsidian.Obsidian
flatpak run md.obsidian.Obsidian
```
