
// AFAFAFAF



class ChatBot {

    // #context

    constructor(context_file_path){

        // make private 
        // this.#context = this.loadContext(context_file_path)
        this.context_file_path = context_file_path
        this.context = this.loadContext(context_file_path)
    }

    loadContext(context_file_path){
        const context = require(context_file_path)        
        // console.log(context)
        return context
    }

    respond(message){
        let formated_message = message.replace(/[.,\/@<>#!?$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase().split(' ')
        
        let best_response_probability = 0 
        let best_response = 'Not sure what you mean. Try rephrasing!'

        for(let index = 0; index < this.context.length; index++){
            let response_probability = this.calculate_response_probability(formated_message, this.context[index])
            if (response_probability > best_response_probability) {
                best_response_probability = response_probability
                best_response = this.context[index]['response']
            }
        }

        return best_response
    }

    calculate_response_probability(message, response) {
        let score =  0
        
        // calculating the number of words in a message that match response 
        for (let index = 0; index < message.length; index ++){
            
            if (response['words'].includes(message[index])){
                
                score += 1
            }
        }
        // checking if response is of type "single response"
        if (response['single response']) {
            return (score / message.length) * 100
        }
        

        // checking for required words, if not found return 0 
        for (let index = 0; index < response['required words'].lenght; index++){
            if (!message.includes(response['required words'][index])){
                return 0
            }
        }
        return (score / message.length) * 100

    }

    update_context() {
        const readline = require('node:readline');
        
        let new_entry = {

        }
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        
        // console bot interface
        
        const handleWords = (input) => {

            new_entry["words"] = input.split(' ')            

            console.log('Is it a single response?')
            rl.question('> ', handleSingleResponse);
            
        };

        const handleSingleResponse = (input) => {

            if (input == 'yes') {
                new_entry["single response"] = true
                console.log('Enter required words!')
                rl.question('> ', handleRequiredWords);
                return
            }

            if (input == 'no') {
                new_entry["single response"] = false
                console.log('Enter required words!')
                rl.question('> ', handleRequiredWords);
                return
            }           

            console.log('Try again!')
            rl.question('> ', handleRequiredWords);
            
        };

        const handleRequiredWords = (input) => {

            new_entry["required words"] = input.split(' ')            

            console.log('Enter the response!')
            rl.question('> ', handleResponse);
            
        };

        const handleResponse = (input) => {

            new_entry["response"] = input        

            console.log('Thank you!')
            rl.close()
            
        };
            
        console.log('Enter words:');
        rl.question('> ', handleWords);
            
        rl.on('close', () => {
            this.context.push(new_entry)

            const jsonString = JSON.stringify(this.context, null, 2)

            const fs = require('fs')

            fs.writeFile(
                this.context_file_path,
                jsonString,
                err => {
                    // Checking for errors 
                    if (err) throw err;
            
                    // Success 
                    console.log("Done writing");
                    process.exit(0)
                })
            
        })

    }

}



const readline = require('node:readline');

bot = new ChatBot('./context.json')

// bot.update_context()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// console bot interface

const handleInput = (input) => {
    const trimmedInput = input.trim().toLowerCase();
  
    if (trimmedInput === 'exit') {
      console.log('Exiting...');
      rl.close();
    } else {
      console.log(bot.respond(input));
      // Prompt the user for the next input
      rl.question('> ', handleInput);
    }
  };
  
  console.log('Enter your message (type "exit" to quit):');
  rl.question('> ', handleInput);
  
  rl.on('close', () => {
    process.exit(0);
  })
