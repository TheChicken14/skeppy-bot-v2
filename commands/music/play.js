const { MessageEmbed } = require("discord.js");
const SkeppyCommand = require("../../structures/SkeppyCommand");
const SkeppyTrack = require("../../structures/SkeppyTrack");
const MusicPermUtils = require("../../utils/MusicPermUtils");

module.exports = class PlayCommand extends SkeppyCommand {
  constructor(client) {
    super(client, {
      name: "play",
      memberName: "play",
      aliases: ["p"],
      group: "music",
      description: "Play music!",
      guildOnly: true,
      clientPermissions: ["CONNECT", "SPEAK"],
      args: [
        {
          key: "song",
          prompt: "Which song do you want to play?",
          type: "string",
        },
      ],
    });

    this.utils = new MusicPermUtils();
  }

  async run(message, { song }) {
    if (!this.utils.canStartOrPlay(message)) {
      return;
    }

    message.channel.startTyping();

    const node = this.client.player.getNode();

    let results;

    if (this.checkURL(song)) {
      results = await node.rest.resolve(song);
    } else {
      results = await node.rest.resolve(song, "youtube");
    }

    if (!results) {
      message.channel.stopTyping();
      message.reply("I couldn't find anything...");
      return;
    }

    const track = new SkeppyTrack(
      results.tracks.shift(),
      message.author,
      message.channel
    );

    const dispatcher = await this.client.queue.handle({
      message,
      node,
      track,
    });

    message.channel.stopTyping();

    if (results.type == "PLAYLIST") {
      // Add all tracks to the queue
      for (const track of results.tracks) {
        await this.client.queue.handle({
          message,
          node,
          track: new SkeppyTrack(track, message.author, message.channel),
        });
      }

      // Send the playlist added to queue embed
      const playlistEmbed = new MessageEmbed()
        .setTitle(`Added playlist ${results.playlistName} to queue`)
        .setDescription(
          `Added ${results.tracks.length + 1} tracks to the queue!`
        )
        .setColor("GREEN");

      message.embed(playlistEmbed);
    } else {
      message.embed(this.client.music.addedToQueueEmbed(track));
    }

    if (dispatcher) {
      await dispatcher.play();
    }
  }

  checkURL(text) {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }
};
