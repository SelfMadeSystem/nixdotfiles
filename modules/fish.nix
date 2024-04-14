{ ... }: {
  programs.fish = {
    enable = true;
    shellInit = ''
      fish_add_path $HOME/.npm-global/bin/
    '';
  };
}
