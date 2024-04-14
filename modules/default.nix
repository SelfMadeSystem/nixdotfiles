{ ... }: {
  imports =
    [
      (import ./hyprland)
      (import ./waybar)
      (import ./kitty.nix)
      (import ./git.nix)
      (import ./fish.nix)
      (import ./quickshell.nix)
      (import ./vscode.nix)
    ];
}
