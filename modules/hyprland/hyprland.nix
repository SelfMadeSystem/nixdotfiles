{ ... }: {
  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      exec-once = "waybar & quickshell";
      dwindle = {
        pseudotile = true;
        preserve_split = true;
      };
      general = {
        # See https://wiki.hyprland.org/Configuring/Variables/ for more
        gaps_in = 5;
        gaps_out = 20;
        border_size = 0;
        "col.active_border" = "rgba(33ccffee) rgba(00ff99ee) 45deg";
        "col.inactive_border" = "rgba(595959aa)";

        layout = "dwindle";
      };
      decoration = {
        # See https://wiki.hyprland.org/Configuring/Variables/ for more
        rounding = 10;

        blur = {
          enabled = true;
          size = 4;
          passes = 2;
        };

        drop_shadow = "yes";
        shadow_range = 4;
        shadow_render_power = 3;
        "col.shadow" = "rgba(1a1a1aee)";
      };
      animations = {
        enabled = "yes";

        # Some default animations, see https://wiki.hyprland.org/Configuring/Animations/ for more

        animation = [
          "windows, 1, 4, default"
          "windowsOut, 1, 4, default, popin 80%"
          "border, 1, 8, default"
          "borderangle, 1, 8, default"
          "fade, 1, 4, default"
          "workspaces, 1, 4, default"
        ];
      };
      windowrule = [
        "noborder,^kitty$"
      ];
      layerrule = [
        "blur,waybar"
      ];
      misc = {
        force_default_wallpaper = -1;
      };
    };
  };
}
