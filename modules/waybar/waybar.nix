{ config, ... }: {
  programs.waybar = {
    enable = true;
  };
  home.file =
    let
      reset = {
        onChange = "pkill -f waybar && waybar &";
      };
    in
    {
      "${config.xdg.configHome}/waybar/config" = reset;
      "${config.xdg.configHome}/waybar/style.css" = reset;
    };
}
