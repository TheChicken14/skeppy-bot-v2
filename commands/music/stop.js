const SkeppyCommand = require("../../structures/SkeppyCommand");
const MusicPermUtils = require("../../utils/MusicPermUtils");
const MusicUtils = require("../../utils/MusicUtils");

module.exports = class StopCommand extends SkeppyCommand {
  constructor(client) {
    super(client, {
      name: "stop",
      memberName: "stop",
      aliases: ["dc", "disconnect", "sotp", "leave"],
      group: "music",
      description: "Stop the music player!",
      guildOnly: true,
    });
    this.utils = new MusicPermUtils();
  }

  async run(message) {
    // const dispatcher = MusicUtils.checkIfAllowed({
    //   message,
    //   client: this.client,
    // });

    if (!this.utils.test(message, "STOP_QUEUE")) {
      return;
    }

    const dispatcher = this.client.queue.get(message.guild.id);
    await dispatcher.destroy();

    message.react("🛑");
  }
};
