{ pkgs
, inputs
, system
, ...
}:
let
  inherit (inputs) quickshell;
in
{
  home.packages = with pkgs; [
    quickshell.packages.${system}.default
  ];
}
