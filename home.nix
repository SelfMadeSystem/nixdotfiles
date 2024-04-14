{ config
, pkgs
, ...
}:
with import <nixpkgs> { };
{
  nixpkgs.config.allowUnfree = true;

  # Home Manager needs a bit of information about you and the paths it should
  # manage.
  home.username = "sms";
  home.homeDirectory = "/home/sms";

  # This value determines the Home Manager release that your configuration is
  # compatible with. This helps avoid breakage when a new Home Manager release
  # introduces backwards incompatible changes.
  #
  # You should not change this value, even if you update Home Manager. If you do
  # want to update the value, then make sure to first check the Home Manager
  # release notes.
  home.stateVersion = "23.11"; # Please read the comment before changing.

  fonts.fontconfig.enable = true;

  # The home.packages option allows you to install Nix packages into your
  # environment.
  home.packages = with pkgs; [
    # # Adds the 'hello' command to your environment. It prints a friendly
    # # "Hello, world!" when run.
    # pkgs.hello

    # # It is sometimes useful to fine-tune packages, for example, by applying
    # # overrides. You can do that directly here, just don't forget the
    # # parentheses. Maybe you want to install Nerd Fonts with a limited number of
    # # fonts?
    # (pkgs.nerdfonts.override { fonts = [ "FantasqueSansMono" ]; })

    # # You can also create simple shell scripts directly inside your
    # # configuration. For example, this adds a command 'my-hello' to your
    # # environment:
    # (pkgs.writeShellScriptBin "my-hello" ''
    #   echo "Hello, ${config.home.username}!"
    # '')
    wl-clipboard
    kgx
    firefox
    cinnamon.nemo
    cinnamon.nemo-emblems
    cinnamon.nemo-fileroller
    pavucontrol
    vesktop
    armcord
    lf
    nixpkgs-fmt
    nixd
    sway-contrib.grimshot
    # gnome-photos
    loupe
    gedit
    playerctl
    brightnessctl
    neofetch
    nodejs
    wayvnc
    cmatrix
    busybox
    lolcat
    cowsay
    fortune
    pipes-rs
    peaclock
    lz4
    obs-studio
    glpaper
    qt6.full
    qtcreator
    cava

    tracker
    tracker-miners

    lxqt.lxqt-policykit

    waybar
    swww # bg
    dunst # notif thing
    libnotify
    rofi-wayland

    (nerdfonts.override { fonts = [
      "JetBrainsMono"
      "Noto"
      "SourceCodePro"
      "Ubuntu"
      "UbuntuMono"
      "Terminus"
      ]; })
  ]
  ++ (with gnome; [
    seahorse
    cheese
    gnome-music
    evince
    gnome-characters
    gnome-font-viewer
    totem
  ]);

  # Home Manager is pretty good at managing dotfiles. The primary way to manage
  # plain files is through 'home.file'.
  home.file = {
    # # Building this configuration will create a copy of 'dotfiles/screenrc' in
    # # the Nix store. Activating the configuration will then make '~/.screenrc' a
    # # symlink to the Nix store copy.
    # ".screenrc".source = dotfiles/screenrc;

    # # You can also set the file content immediately.
    # ".gradle/gradle.properties".text = ''
    #   org.gradle.console=verbose
    #   org.gradle.daemon.idletimeout=3600000
    # '';

    # ".icons/Bibata-Modern-Classic".source = "${pkgs.bibata-cursors}/share/icons/Bibata-Modern-Classic";

    "${config.xdg.configHome}" = {
      source = ./dotfiles;
      recursive = true;
    };
  };

  home.pointerCursor = {
    size = 40;
    package = pkgs.bibata-cursors;
    name = "Bibata-Modern-Classic";
  };

  gtk = {
    enable = true;
    theme = {
      name = "adw-gtk3-dark";
      package = pkgs.adw-gtk3;
    };
  };

  # Home Manager can also manage your environment variables through
  # 'home.sessionVariables'. If you don't want to manage your shell through Home
  # Manager then you have to manually source 'hm-session-vars.sh' located at
  # either
  #
  #  ~/.nix-profile/etc/profile.d/hm-session-vars.sh
  #
  # or
  #
  #  /etc/profiles/per-user/sms/etc/profile.d/hm-session-vars.sh
  #
  home.sessionVariables = {
    EDITOR = "micro";
    BROWSER = "firefox";
    TERMINAL = "kitty";
  };

  # Let Home Manager install and manage itself.
  programs.home-manager.enable = true;
}
