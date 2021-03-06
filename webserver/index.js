const express = require("express");
const SkeppyCommandoClient = require("../structures/SkeppyCommandoClient");
const InfoUtils = require("../utils/InfoUtils");

/**
 * @param {SkeppyCommandoClient} client
 */
function run(client) {
  const app = express();
  const info = new InfoUtils();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/stats", async (req, res) => {
    const usages = await client.usages.all();
    const stats = {
      servers: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      uptime: Math.round(process.uptime()),
      uptime_formatted: info.getNodeUptime(),
      commands: client.registry.commands.size,
      executedCommands: usages,
    };

    res.send(stats);
  });

  app.get("/api/commands", (req, res) => {
    const commands = client.registry.commands.map((command) => ({
      name: command.name,
      description: command.description,
      aliases: command.aliases || [],
      examples: command.examples || [],
      group: command.group.name,
      format: `${this.client.commandPrefix}${command.name}${
        command.format ? " " + command.format : ""
      }`,
      groupID: command.groupID,
      ownerOnly: command.ownerOnly || false,
    }));

    res.json(commands);
  });

  app.listen(client.config.web.port, () =>
    console.log(`Webserver running on port ${client.config.web.port}`)
  );
}

module.exports = run;
