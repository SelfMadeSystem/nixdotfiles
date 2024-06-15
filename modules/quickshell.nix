{ inputs
, system
, ...
}:
let
  inherit (inputs) quickshell;
in
{
  home.packages = [
    quickshell.packages.${system}.default
  ];
}
