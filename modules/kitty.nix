{ ... }: {
  programs.kitty = {
    enable = true;
    settings = {
      font_family = "JetBrainsMono Nerd Font Mono";
      window_padding_width = 4;
      background_opacity = "0.65";
    };
  };
}
