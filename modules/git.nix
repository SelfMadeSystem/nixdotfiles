{ ... }: {
  programs.git = {
    enable = true;
    userName = "SelfMadeSystem";
    userEmail = "sms@shoghisimon.cc";
    extraConfig = {
      commit.gpgsign = true;
      user.signingkey = "8E418AC8C710C11F";
    };
  };
}
