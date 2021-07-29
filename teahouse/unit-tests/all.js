const util = require('util')
const assert = require('assert');
const chatroom = require('./nth').chatroom

const print = (o) => console.dir(o, {depth: null})

const main = async() =>
{


    /*
     * Test create chatroom.
     *
     * The .enable method should automatically
     * run create with these variables.
     */
    let conv0 = await new chatroom({
        server: 'http://localhost:13337',
        username: "a",
        password: "1234567890",
        nickname: "thomas",
        chatroom_name: "best chat",
    }).enable();


    print(conv0)
    console.log('============================================================================')


    // a couple of tests
    assert(conv0.chatroomID);
    assert(conv0.cookie);
    assert(conv0.channels.length == 1);
    assert(conv0.classes.length == 2);
    assert(conv0.users.length == 1);
    assert(conv0.settings.length == 3);
    assert(conv0.chatroom_name)

    console.log("✅ Successfully created chatroom!");

    /*
     * Test login.
     *
     * Ofc login should not be used like this,
     * for many reasons, including the fact that
     * create already assinged a cookie, thus its redundant.
     *
     * Howerver for unit tests this makes more sense.
     */
    let conv1 = await new chatroom(conv0).enable()

    assert(conv0.chatroom_name == conv1.chatroom_name);
    assert(conv0.chatroomID    == conv1.chatroomID);

    assert(JSON.stringify(conv0.channels) == JSON.stringify(conv1.channels));
    assert(JSON.stringify(conv0.settings) == JSON.stringify(conv1.settings));
    assert(JSON.stringify(conv0.classes)  == JSON.stringify(conv1.classes));
    assert(JSON.stringify(conv0.users)    == JSON.stringify(conv1.users));

    console.log("✅ Successfully logged in!");




    /*
     * Test getting chatroom information,
     * and check_login.
     *
     * This function is used both to get general
     * information about a chatroom and to check
     * whether the client is logged in.
     * (ie cookies are valid)
     */

    let info = await conv1.get_chat_info()
    info = info.data

    assert(info.chatroom_name == conv1.chatroom_name);
    assert(info.chatroomID    == conv1.chatroomID);

    assert(JSON.stringify(info.channels) == JSON.stringify(conv1.channels));
    assert(JSON.stringify(info.settings) == JSON.stringify(conv1.settings));
    assert(JSON.stringify(info.classes)  == JSON.stringify(conv1.classes));
    assert(JSON.stringify(info.users)    == JSON.stringify(conv1.users));

    console.log("✅ Successfully checked login / got chatroom info!");



    /*
     * Test creating a new channel.
     */
    let channel_name = "memes channel";
    let permissions = [{
        classID: '1',
        r: true,
        w: false,
        x: false
    }]
    await conv1.create_channel({
        channel_name,
        permissions
    })
    .then((res) =>
        {
            assert(channel_name == res.data.name)
            assert(JSON.stringify(permissions) == JSON.stringify(res.data.permissions))
            console.log("✅ Created new channel");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to create channel!");
            process.exit(1);
        });


    await conv1.send_message({
        message: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
        channelID: conv1.channels[0].channelID,
    })
    .then((res) =>
        {
            console.log(res.data)
            console.log("✅ successfully sent message");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to send message!");
        });


    console.log('==========================================================')
    print(conv1);

    process.exit(0);
































    // process.exit(1);

    let middle_message_time = 0;
    let i = 0;
    while (i < 100)
    {
        // send 100 messages to differnt channels
        await conv0.send_message({
            message: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
            channelID: conv0.channels[i%2].channelID
        })
        .then((res) =>
            {
                // console.log(conv)
                // console.log(res)
            })
        .catch((res) =>
            {
                console.log(res);
                console.error("❌ Failed to send message!");
            });

        if (i == 49)
            middle_message_time = new Date().getTime() / 1000

        // await conv._sleep(500)
        i += 1
    }
    console.log("✅ sent 100 messages!");







    await conv0.monitor_messages({
        since: 0
    })
    .then((res) =>
        {
            // console.log(res);
            // console.log('got:', res.length);


            let seen = []
            for (const message of res)
            {
                assert(!seen.includes(message.messageID), "wtf");
                seen.push(message.messageID);
            }
            // assert(res.length == 50, "Got wrong amount of messages");
            console.log("✅ Got messages since <time>");
            // process.exit(1);
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });


    await conv0.get_messages({
        count: 100,
        // start_time: 1624611669.907108,
        // channelID: conv.channels[0].channelID
    })
    .then((res) =>
        {
            // console.log(res.length);
            // assert(res.length == 5, "Got wrong amount of messages!");
            console.log("✅ Got <count> messages!");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });


    await conv0.get_messages({
        count: 100,
        start_time: middle_message_time,
        // channelID: conv.channels[0].channelID
    })
    .then((res) =>
        {
            // console.log(res.length);
            assert(res.length == 51, "Got wrong amount of messages!");
            console.log("✅ Got <count> messages with start_time!");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });




    await conv0.monitor_messages({
        count: 5,
        since: middle_message_time,
        channelID: conv0.channels[0].channelID
    })
    .then((res) =>
        {
            // console.log(res.length)

            // check if everything worked
            for (const msg of res)
                assert(msg.channelID == conv0.channels[0].channelID, "Failed to filter ot one channel!")

            console.log("✅ Got messages since <time> with channel filter.");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });


    await conv0.get_messages({
        count: 5,
        // start_time: 1624611669.907108,
        channelID: conv0.channels[1].channelID
    })
    .then((res) =>
        {
            // console.log(res.length);

            // check if everything worked
            for (const msg of res)
                assert(msg.channelID == conv0.channels[1].channelID, "Failed to filter ot one channel!")

            // assert(res.length == 5, "Got wrong amount of messages!");
            console.log("✅ Got <count> messages with channel filter.");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });


    await conv0.get_messages({
        count: 100,
        start_time: middle_message_time,
        channelID: conv0.channels[0].channelID
    })
    .then((res) =>
        {
            // console.log(res.length);

            // check if everything worked
            for (const msg of res)
                assert(msg.channelID == conv0.channels[0].channelID, "Failed to filter ot one channel!")

            // assert(res.length == 51, "Got wrong amount of messages!");
            console.log("✅ Got <count> messages with start_time and channel filter");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get messages!");
            process.exit(1);
        });








    await conv0.get_users()
    .then((res) =>
        {
            // console.log(res)
            console.log("✅ Got users");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to get users!");
            process.exit(1);
        });

    await conv0.create_invite({
        uses: 10,
        expiration_time: (new Date().getTime() / 1000) + 1000
    })
    .then((res) =>
        {
            conv0.invite = res.inviteID;
            // console.log(res)
            console.log("✅ Created invite!");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to create invite!");
            process.exit(1);
        });


    await conv0.use_invite({
        inviteID: conv0.invite,
        username: 'hehehehehe',
        password: 'newpw, very cool!'
    })
    .then((res) =>
        {
            // console.log(res)
            console.log("✅ Used invite to join chatroom");
        })
    .catch((res) =>
        {
            console.log(res);
            console.error("❌ Failed to use invite");
        });


    console.log("\n------------------------------------------------------\n")
    console.dir(conv0, { depth: null });
}

main()


