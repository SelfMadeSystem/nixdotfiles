{ ... }: {
  wayland.windowManager.hyprland.settings = {
    input = {
      kb_layout = "us";
      kb_variant = "colemak";

      touchpad = {
        natural_scroll = "yes";
        clickfinger_behavior = 1;
      };
    };
    gestures = {
      # See https://wiki.hyprland.org/Configuring/Variables/ for more
      workspace_swipe = "on";
    };
    "$mod" = "SUPER";
    bindr = ''SUPER, SUPER_L, exec, rofi -show drun -theme "$HOME/.config/rofi/themes/app-launcher.rasi"'';
    bind =
      [
        # Example binds, see https://wiki.hyprland.org/Configuring/Binds/ for more
        "$mod, F, exec, firefox"
        "$mod, T, exec, xterm"
        "$mod, RETURN, exec, kitty"
        "$mod, Q, killactive,"
        "$mod SHIFT, Q, exit,"
        "$mod, SPACE, togglefloating,"
        ", Print, exec, grimshot copy area"
        "SHIFT, Print, exec, grimshot copy screen"
        "$mod, P, pseudo,"

        # Move Focus
        "$mod, left, movefocus, l"
        "$mod, right, movefocus, r"
        "$mod, up, movefocus, u"
        "$mod, down, movefocus, d"

        # Move active window
        "$mod SHIFT, left, movewindow, l"
        "$mod SHIFT, right, movewindow, r"
        "$mod SHIFT, up, movewindow, u"
        "$mod SHIFT, down, movewindow, d"
      ]
      ++ (
        # workspaces
        # binds $mod + [shift +] {1..10} to [move to] workspace {1..10}
        builtins.concatLists (builtins.genList
          (
            x:
            let
              ws =
                let
                  c = (x + 1) / 10;
                in
                builtins.toString (x + 1 - (c * 10));
            in
            [
              "$mod, ${ws}, workspace, ${toString (x + 1)}"
              "$mod SHIFT, ${ws}, movetoworkspace, ${toString (x + 1)}"
            ]
          )
          10)
      );
    bindm = [
      # Move/resize windows with mainMod + LMB/RMB and dragging
      "$mod, mouse:272, movewindow"
      "$mod, mouse:273, resizewindow"
    ];
    # Volume, media, and brightness keys
    bindl = [
      ", XF86AudioMute, exec, wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"
      # the stupid key is called play , but it toggles 
      ", XF86AudioPlay, exec, playerctl play-pause"
      ", XF86AudioNext, exec, playerctl next "
      ", XF86AudioPrev, exec, playerctl previous"
    ];
    bindle = let max-vol = "2.0"; in [
      ", XF86AudioRaiseVolume, exec, wpctl set-volume -l ${max-vol} @DEFAULT_AUDIO_SINK@ 5%+"
      ", XF86AudioLowerVolume, exec, wpctl set-volume -l ${max-vol} @DEFAULT_AUDIO_SINK@ 5%-"
      ", XF86MonBrightnessDown, exec, brightnessctl set 5%-"
      ", XF86MonBrightnessUp, exec, brightnessctl set 5%+"
    ];
  };
}
