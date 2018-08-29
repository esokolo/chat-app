module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    let users = []
    const messages = []

    // when the page is loaded in the browser the connection event is fired
    io.on('connection', socket => {

        // on making a connection - load in the content already present on the server
        socket.emit('refresh-messages', messages)
        socket.emit('refresh-users', users)

        socket.on('join-user', userName => {            
            let flag = false
            
            users.forEach(element => 
            {
                if (element.name.toUpperCase() === userName.toUpperCase()) 
                    flag = true
            })
            
            if (flag == false)
            {
                const user = {
                    id: socket.id,
                    name: userName,
                    matched: flag, 
                    avatar: `https://robohash.org/${userName}?set=set3` 
                }
                
                users.push(user)
    
                io.emit('successful-join', user)
                io.emit('failed-join', "")
            }
            else
            {
                io.emit('failed-join', "Choose a different name please")
            }
        })

        socket.on('send-message', data => {
            const content = {
                user: data.user,
                message: data.message,
                date: moment(new Date()).format('MM/DD/YY h:mm a'),
                avatar: `https://robohash.org/${data.user.name}?set=set3`  
            }
            messages.push(content)

            io.emit('successful-message', content)
        })

        socket.on('disconnect', () => {
            users = users.filter(user => {
                return user.id != socket.id
            })

            io.emit('refresh-users', users)
        })
    })
}
