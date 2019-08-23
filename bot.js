var Discord = require('discord.js');
var client = new Discord.Client();
var auth = require('./auth.json');
var fs = require('fs');

client.on("ready", () => {
    console.log(`logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot) return;
    
    let rand = Math.floor(Math.random() * 100)
    console.log(rand.toString());
    if (rand == 50) {
        msg.channel.send("let's give a quick shoutout to Christina Applegate", {files: ["christina.jpg"]})
    }

   if (msg.content.toLowerCase() === 'copypasta help') {
    msg.channel.send({ embed: {
        color: 3447003,
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
        },
        title: 'Help',
        description: 'Help for commands with Copypasta bot.',
        fields: [{
            name: 'copypasta create [pasta name] [pasta text]',
            value: 'Creates a new copypasta. Include an asterisk \'*\' in the text to include arguments for the copypasta. ' +
                    '\nPasta name must be one phrase without spaces. Hyphens and underscores can be used to use more than one word.' +
                    '\nEx. copypasta create leave_server my name is * and I would like to leave this server '
        },
        {
            name: 'copypasta update [pasta name] [pasta text]',
            value: 'update an already created pasta'
        },
        {
            name: 'copypasta list',
            value: 'list out all of the pastas. Use optional flag -text (i.e copypasta list -text) to list all of the pastas\' names ' +
                    'and up to 50 characters of their text'
        }],
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
          }
    }});

   }
   let parsed = msg.content.split(' ');
   if (parsed[0].toLowerCase() == "copypasta" && parsed[1].toLowerCase() == "create") {
      try {
          let pasta_name = parsed[2]
          let pasta_text = ""
          let counter = 0
          let pasta_exists = false
          parsed.forEach(function(text) {
              if (counter == parsed.length - 1) {
                  pasta_text += text
              }
              else if (counter > 2) {
                pasta_text += text + " "
              }
              counter++             
          })
          fs.readFile('copypasta.json', function(err, data){
            if (err){
                console.log(err);
            } else {
                obj = JSON.parse(data);
                obj.forEach(function(pasta) {
                    if (Object.values(pasta)[0] == pasta_name) {
                        msg.channel.send(pasta_name + " pasta already exists, use [copypasta update] to change existing pasta")
                        pasta_exists = true
                    }
                })
                if (!pasta_exists) {
                    obj.push({"name":pasta_name, "text":pasta_text}); 
                }
                json = JSON.stringify(obj); 
                fs.writeFileSync('copypasta.json', json);
            }
          })
          pasta_exists = false
      }
      catch (indexoutofboundsexception) {

      }
    }
    else if (parsed[0].toLowerCase() == "copypasta" && parsed[1].toLowerCase() == "list") {
        let pastas = ""
        let counter = 0
        fs.readFile('copypasta.json', function(err, data){
            if (err){
                console.log(err);
            } else {
                obj = JSON.parse(data);
                obj.forEach(function(pasta) {
                    let name = Object.values(pasta)[0]
                    let text = Object.values(pasta)[1]
                    if (parsed[2] == "-text"){
                        if (counter == obj.length - 1) {
                            pastas += name + ": " + text.substring(0,49)
                            if (text.length > 50) {
                                pastas += "... "
                            }
                        }
                        else {
                            pastas += name + ": " + text.substring(0,49) 
                            if (text.length > 50) {
                                pastas += ".., " 
                            } 
                            else {
                                pastas += ", "
                            }
                        } 
                    }
                    else {
                        if (counter == obj.length - 1) {
                            pastas += name
                        }
                        else {
                            pastas += name + ", "
                        }
                    }
                    counter++
                })
            }
            msg.channel.send(pastas)
        })
           
        
    }

    else if (parsed[0].toLowerCase() == "copypasta" && parsed[1].toLowerCase() == "update") {
        let pasta_name = parsed[2]
        let pasta_text = ""
        let counter = 0
        parsed.forEach(function(text) {
            if (counter == parsed.length - 1) {
                pasta_text += text
            }
            else if (counter > 2) {
              pasta_text += text + " "
            }
            counter++             
        })
        counter = 0
        fs.readFile('copypasta.json', function(err, data){
          if (err){
              console.log(err);
          } else {
              obj = JSON.parse(data);
              obj.forEach(function(pasta) {
                  if (Object.values(pasta)[0] == pasta_name) {
                    obj[counter] = {"name":pasta_name, "text":pasta_text}
                  }
                  counter++
              })
              json = JSON.stringify(obj); 
              fs.writeFileSync('copypasta.json', json);
          }
        })
    }

    else if (parsed[0].toLowerCase() == "copypasta") {
        let counter = 0
        let c = 0
        var list = []
        var arg = msg.content
        var matches = arg.match(/\[(.*?)\]/);
        try {
            fs.readFile('copypasta.json', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    obj.forEach(function(pasta) {
                        let name = Object.values(pasta)[0]
                        let text = Object.values(pasta)[1]
                    
                        if (parsed[1] == name) {
                            while (matches) {
                                list.push(matches[1])
                                arg = arg.replace(matches[0], c.toString())
                                matches = arg.match(/\[(.*?)\]/);
                                c++
                            }
                            let parse = text.split(/[, | ]/)
                            parse.forEach(function(token){
                                if (token == "*") {
                                    counter++
                                }
                            })
                            c = 0
                            let arg_parse = arg.split(' ')
                            for (i = 0; i < counter; i++) {
                                if (!isNaN(arg_parse[i+2])) {
                                    text = text.replace('*', list[c])
                                    c++
                                }
                                else {
                                    text = text.replace("*", arg_parse[i+2])
                                }
                            }
                            
                            msg.channel.send(text)
                        }
                    })
                }
            })
        }
        catch (indexoutofboundsexception) {
        }
    }    
});

client.login(auth.token);