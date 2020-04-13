const Discord = require("discord.js");
var { CanvasRenderService } = require('chartjs-node-canvas');
var pluginChart = require('chartjs-plugin-datalabels');

// load config
const config = require("./config.json");

const client = new Discord.Client();

var scores = {};

const scoreIncrease = (id, value) => {
  newvalue = (scores[id]) ? (scores[id] + value) : (+value)
  scores[id] = newvalue
};

const scoreDecrease = (id, value) => {
  newvalue = (scores[id]) ? (scores[id] - value) : (-value)
  scores[id] = newvalue
};

const scoreReset = (id) => {
  if(scores[id] ) { scores[id] = 0;}
};

const scoreAdd = (id) => {
  if(!scores[id] ) { scores[id] = 0;}
};

const scoreRemove = (id) => {
  delete scores[id]
  //if(!scores[id] ) { scores[id] = 0;}
}

client.on("ready", () => {
  console.log("I am ready to start scoring");
  client.user.setActivity(`Shazam !`);
});

client.on('messageReactionAdd', (reaction, user) => {
  if (!checkMessageAuthorIsMaster(reaction.message, user)) return;

  if(reaction.emoji.name === config.reactionScoreUpdate) {
    userid = reaction.message.author.id
    scoreIncrease(userid, 1)
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  if (!checkMessageAuthorIsMaster(reaction.message, user)) return;

  if(reaction.emoji.name === config.reactionScoreUpdate) {
    userid = reaction.message.author.id
    scoreDecrease(userid, 1)
  }
});

client.on("message", (message) => {
  // do not process bot messages
  if(message.author.bot) return;

  // do not process message without bot prefix
  if(message.content.indexOf(config.prefix) !== 0) return;

  // flag for bot feedback on current message
  sucess = false

  // Split messages
  commands = getCommandsFromMessage(message)
  if (commands.length > 0) {
    // take frist instruction only
    cmd = getCmdFromCommand(commands[0])
    // show result scores
    if (cmd == "scores") {
      createScoreImage(scores, message)
      return;
    }
  }

  // only master is allowed to call the additionnal command
  if(!checkMessageAuthorIsMaster(message, message.author)) {
    message.channel.send('Hey <@' + message.author.id + '>! You re not a Score Master');
    message.react(config.reactionFeedbackFail);
    return;
  }

  if (commands.length > 0) {
    // take frist instruction only
    cmd = getCmdFromCommand(commands[0])
    args = getArgsFromCommand(commands[0])
    if(cmd == "pa") {
      addPlayers(args, message)
      sendReactionFeedback(message)
      return
    } else if (cmd == "pr"){
      removePlayers(args, message)
      sendReactionFeedback(message)
      return
    }
    else if (cmd == "r") {
      scores = {};    sucess = true
      scores = {};
      sendReactionFeedback(message)
      return
    }

    // If one or multiple commmands with score manipulation
    allcommandValid = true
    for(var i=0; i< commands.length; i++) {
      cmd = getCmdFromCommand(commands[i])
      args = getArgsFromCommand(commands[i])
      allcommandValid = allcommandValid && isCommandValid(cmd, args, message)
    }

    if (allcommandValid) {
      commandesProcessed = true
      for(var i=0; i< commands.length; i++) {
        cmd = getCmdFromCommand(commands[i])
        args = getArgsFromCommand(commands[i])
        commandesProcessed= commandesProcessed && processScoreCmd(cmd, args, message)
      }
      if (commandesProcessed) {
        sendReactionFeedback(message)
      }
      else{
        console.log("ERROR Cmd not processed but validated before")
      }
    } else {
      message.channel.send('Hey <@' + message.author.id + '>! Command not correct');
    }
  }
});

function sendReactionFeedback(message) {
  message.react(config.reactionFeedbackSucess);
}

function processScoreCmd(cmd, args, message) {
  // Get all mentions in args
  valid = false
  isValid = isCommandValid(cmd, args, message)
  if (isValid){
    if (cmd.startsWith("+")) {
      valid = processScoreIncrease(cmd, args, message)
    }
    else if (cmd.startsWith("-")) {
      valid = processScoreDecrease(cmd, args, message)
    }
  }
  return valid
}


function isCommandValid(cmd, args, message) {
  var mentionList = getMentionArray(args)
  var scoreUpdate = getCommandValue(cmd)
  cmdvalid = (cmd.startsWith('+') || cmd.startsWith('-')) ? true : false
  validated = validateMentionArrayFromMessage(message, mentionList)
  isValid = (cmdvalid && scoreUpdate && validated && mentionList.length > 0) ? true : false
  return isValid
}

function processScoreIncrease(cmd, args, message) {
  valid = false
  var scoreUpdate = getCommandValue(cmd)
  var mentionList = getMentionArray(args)
  validated = validateMentionArrayFromMessage(message, mentionList)
  let isValid = (scoreUpdate && validated & mentionList.length > 0) ? true : false
  if (isValid) {
    for(var i=0; i< mentionList.length; i++) {
      scoreIncrease(mentionList[i], scoreUpdate);
      valid = true
    }
  } else {
    message.channel.send('Hey <@' + message.author.id + '>! Who is earning points ?');
  }
  return valid
}

function processScoreDecrease(cmd, args, message) {
  valid = false
  var scoreUpdate = getCommandValue(cmd)
  var mentionList = getMentionArray(args)
  validated = validateMentionArrayFromMessage(message, mentionList)
  let isValid = (scoreUpdate && validated & mentionList.length > 0) ? (true) : (false)
  if (isValid) {
    for(var i=0; i< mentionList.length; i++) {
      scoreDecrease(mentionList[i], scoreUpdate);
      valid = true
    }
  } else {
    message.channel.send('Hey <@' + message.author.id + '>! Who is loosing points ?');
  }
  return valid
}

function addPlayers(args, message) {
    var mentionList = getMentionArray(args)
    if (mentionList) {
      validated = validateMentionArrayFromMessage(message, mentionList)
      if (validated & mentionList.length > 0) {
        for(var i=0; i< mentionList.length; i++) {
          scoreAdd(mentionList[i]);
        }
        sucess = true
      } else {
        message.channel.send('Hey <@' + message.author.id + '>! Who are the players to add?');
      }
    }
}

function removePlayers(args, message) {
    var mentionList = getMentionArray(args)
    if (mentionList) {
      validated = validateMentionArrayFromMessage(message, mentionList)
      if (validated & mentionList.length > 0) {
        for(var i=0; i< mentionList.length; i++) {
          scoreRemove(mentionList[i]);
        }
        sucess = true
      } else {
        message.channel.send('Hey <@' + message.author.id + '>! Who are the players to remove?');
      }
    }
}

function getMentionArray(arguments) {
  if (!arguments) return [] ;
  mentionArray = []
  for(var i=0; i< arguments.length; i++){
    mention = arguments[i]
    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);
      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }
      mentionArray.push(mention)
    } else if (mention.startsWith('@') && config.useFakeID) {
        mention = mention.slice(1);
        mentionArray.push(mention)
    }
  }
  return mentionArray
};

function validateMentionArrayFromMessage(message, mentionArray) {
  validated = true
  for(var i=0; i< mentionArray.length; i++){
    found = message.mentions.members.find(member => member.user.id == mentionArray[i]);
    if(found) {
      validated = validated && true
    }
    else {
        if (!config.useFakeID)
          return false
    }
  }
  return validated
};

function getCommandValue(command) {
  value = null
  valueString = command.substr(1);
  try {
    value = parseFloat(valueString);
  }
  catch(error) {
    console.log("Error convert string to float" + valueString)
  }
  return value
};

function checkMessageAuthorIsMaster(message, user)  {
  masterRoleFound = message.guild.roles.cache.find(role => role.name == config.masterRoleName)
  if (masterRoleFound) {
    userfound = masterRoleFound.members.find(guildmember  => guildmember.user.id == user.id)
    isAuthorMaster = (userfound) ? (true) : (false)
  } else {
    console.log("Cannot find name " + config.masterRoleName + " in roles")
    isAuthorMaster = false
  }
  return isAuthorMaster
};

function getCmdFromCommand(command) {
  split = command.split(/ +/g);
  // if command start with spaces remove them
  cmd = (split[0].trim() == '' && split.length > 1) ? (split[1] ) : (split[0])
  return cmd.trim()
}
function getArgsFromCommand(command) {
  split = command.split(/ +/g);
  args = (split[0].trim() == '') ? (split.slice(2) ) : (split.slice(1))
  return args
}
function getCommandsFromMessage(message) {
  withoutPrefix = message.content.slice(config.prefix.length);
  commands = withoutPrefix.split(',');
  return commands
};

function getUserNamesFromIds(message, usersIds) {
  labelUserNamesArray = []
  if (config.useFakeID) {
   labelUserNamesArray = usersIds
  } else {
    for(var i=0; i< usersIds.length; i++) {
      // check user name from playersRoleName
      playerfound = message.guild.roles.cache.find(role => role.name == config.playersRoleName)
      if (playerfound) {
        userfound = playerfound.members.find(guildmember  => guildmember.user.id == usersIds[i])
        if (userfound) {
          displayName = (userfound.nickname) ? (userfound.nickname) : (userfound.user.username)
        } else  {
          displayName = "Toto"
        }
      } else {
        displayName = "Tonton"
      }
      labelUserNamesArray.push(displayName)
    }
  }
  return labelUserNamesArray
}

async function createScoreImage(scores, message) {
  // Extract Score Data
  usersIds = []
  scoresResult = []
  Object.entries(scores).forEach(([key, value]) => {
      usersIds.push(key)
      scoresResult.push(value)
  });

  //--------------------------------//
  // Build DataBar fom Users name & scores
  usersNames = getUserNamesFromIds(message, usersIds)

  if (scoresResult.length == 0)
    return

  scoreMax = Math.max(scoresResult)

  var databar = {
    labels: usersNames,
    datasets: [{
      backgroundColor: "rgba(84, 177, 227, 1)",
      data: scoresResult,
      strokeColor: "black",
      borderWidth: 1
    }]
  }

  //--------------------------------//
  // Chart JS
  const width = 1300;
  const height = 800;
  const font_size = 40;
  const chartCallback = (ChartJS) => {
      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      ChartJS.plugins.register({
          // plugin implementation
      });
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
          // chart implementation
      });
  };

  const canvasRenderService = new CanvasRenderService(width, height, chartCallback);
  (async () => {
      const configuration = {
          type: 'bar',
          data: databar,
          plugins: [pluginChart],
          options: {
              plugins: {
              datalabels: {
                anchor: 'end',
                align: function(context) {
                  value = context.dataset.data[context.dataIndex]
                  if (value < 10 && scoreMax > 20) {
                     alignValue = 'top'
                  }else {
                     alignValue = 'bottom'
                  }
                  return alignValue;
                },
                formatter: function(value) {
                  return Math.round(value * 10) / 10
                },
                font: {
                  weight: 'bold',
                  size: font_size,
                }
              }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: (value) => value
                    }
                }]
            },
            tooltips: {
              legend: {
                display: false
              },
              callbacks: {
                label: function(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
      };

      // Set Global Variables
      canvasRenderService._chartJs.defaults.global.defaultColor = 'rgba(84, 177, 227, 1)'
      canvasRenderService._chartJs.defaults.global.defaultFontColor = '#FFF'
      canvasRenderService._chartJs.defaults.global.defaultFontSize = font_size
      canvasRenderService._chartJs.defaults.global.defaultFontStyle = 'blod'
      canvasRenderService._chartJs.defaults.global.legend.display = false;
      canvasRenderService._chartJs.helpers.merge(canvasRenderService._chartJs.defaults.global.plugins.datalabels, {
        color: '#FE777B'
      });

      const image = await canvasRenderService.renderToBuffer(configuration);

      const attachment = new Discord.MessageAttachment(image, 'scoresResults.png');
      message.channel.send(`Current Scores`, attachment);
  })();

  return null
};

client.login(config.token);
