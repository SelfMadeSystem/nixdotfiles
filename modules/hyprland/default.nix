{ ... }: {
  imports =
    [
      (import ./hyprland.nix)
      (import ./input.nix)
    ];
}
