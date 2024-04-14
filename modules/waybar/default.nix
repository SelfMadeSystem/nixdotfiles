{ ... }: {
  imports =
    [
      (import ./waybar.nix)
      (import ./top-bar.nix)
      (import ./style.nix)
    ];
}
