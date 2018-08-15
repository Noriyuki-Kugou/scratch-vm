const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const languageNames = require('scratch-translate-extension-languages');
const formatMessage = require('format-message');


const iconURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0i44Os44Kk44Ok44O8XzEiIGRhdGEtbmFtZT0i44Os44Kk44Ok44O8IDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYyLjg3IDU5LjE5Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2UwZTBlMDt9LmNscy0ye2ZpbGw6IzJiMmIyYjt9LmNscy0ze2ZpbGw6I2Q4ZDZkNjt9LmNscy00e2ZpbGw6IzM2NDc3MDt9LmNscy01e2ZpbGw6IzIzMjMyMzt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPnJ1bG88L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ4LjA1LDUyLjc1LDYxLjU5LDI5LjNBMTcuODcsMTcuODcsMCwwLDAsNDYuMTIsMi41SDE5QTE3Ljg3LDE3Ljg3LDAsMCwwLDMuNTYsMjkuM0wxNy4xMSw1Mi43NUExNy44NiwxNy44NiwwLDAsMCw0OC4wNSw1Mi43NVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xLjE0IC0yLjUpIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNDQuNjEsNDQuMzNsOC4xNy0xNi41OUExMy4zNSwxMy4zNSwwLDAsMCw0MC44LDguNUgyNC40N2ExMy4zNSwxMy4zNSwwLDAsMC0xMiwxOS4yNGw4LjE3LDE2LjU5QTEzLjM1LDEzLjM1LDAsMCwwLDQ0LjYxLDQ0LjMzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEuMTQgLTIuNSkiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik00My4yOCw0Mi43NGw3LjIzLTE1LjU3QTExLjczLDExLjczLDAsMCwwLDM5Ljg2LDEwLjVIMjUuNDFBMTEuNzMsMTEuNzMsMCwwLDAsMTQuNzcsMjcuMTdMMjIsNDIuNzRBMTEuNzQsMTEuNzQsMCwwLDAsNDMuMjgsNDIuNzRaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMS4xNCAtMi41KSIvPjxyZWN0IGNsYXNzPSJjbHMtNCIgeD0iMjcuMTEiIHk9IjI5IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiByeD0iNCIgcnk9IjQiLz48cmVjdCBjbGFzcz0iY2xzLTUiIHg9IjI2LjExIiB3aWR0aD0iMTEiIGhlaWdodD0iMiIvPjwvc3ZnPg==';


/*-------------------------------*/
/*----------　変数定義　-----------*/
/*-------------------------------*/
var socket = new WebSocket('ws://rulo.local:9090');

var receive_object = "";
var receive_object_num = 0;
var moving_state = false;
var rulo_button = (new Array(6)).fill(false);
var rulo_bumper_right_state = false;
var rulo_bumper_left_state = false;

const adv_scratch_ros = {"op": "advertise", "topic": "/scratch_ros", "type": "std_msgs/String"};
const sub_ros_scratch = {"op": "subscribe", "topic": "/ros_scratch", "type": "std_msgs/String"};

socket.onopen = function () {//接続が確立された際、TopicのPubSub設定を行う
    socket.send(JSON.stringify(adv_scratch_ros));
    socket.send(JSON.stringify(sub_ros_scratch));
    console.log("Advertise OK");
}//onopen


socket.onmessage = function() {

    var obj = JSON.parse(event.data);
    var msg_data = obj.msg.data;
    console.log('Message from server', msg_data);

    if ( msg_data.indexOf('arrival:') != -1) {
        moving_state = false;
    }else if ( msg_data.indexOf('object:') != -1) {
        receive_object = msg_data.substr(7);
    }else if ( msg_data.indexOf('object_num:') != -1) {
        receive_object_num = parseInt(msg_data.substr(11));
    }else if( msg_data.indexOf('arrive:') != -1){
        moving_state = false;
    }else if(msg_data.indexOf('rulo_bumper:') != -1){
        if(msg_data.indexOf('right_true') != -1){ rulo_bumper_right_state = true; }
        else if(msg_data.indexOf('right_false') != -1){ rulo_bumper_right_state = false; }
        else if(msg_data.indexOf('left_true') != -1){ rulo_bumper_left_state = true; }
        else if(msg_data.indexOf('left_false') != -1){ rulo_bumper_left_state = false; }
    }else if(msg_data.indexOf('rulo_button:') != -1){
        var event_num = parseInt(msg_data.substr(12));
        if(event_num == 0){
            for (var i = 0;  i < rulo_button.length;  i++) { rulo_button[i] = false;}
        }else{//該当配列をtrueに変更。(1,2,4,8,16,32を0,1,2,3,4,5に変換して扱う)
            if(event_num == 1){ rulo_button[0] = true; }
            else if(event_num == 2){ rulo_button[1] = true; }
            else if(event_num == 4){ rulo_button[2] = true; }
            else if(event_num == 8){ rulo_button[3] = true; }
            else if(event_num == 16){ rulo_button[4] = true; }
            else if(event_num == 32){ rulo_button[5] = true; }
        }
    }//rulo_button
}//onmessage


class Scratch3RuloBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this.runtime.on('PROJECT_STOP_ALL', this.stopProgram.bind(this));
    }

    static get STATE_KEY () {
        return 'scratch.rulo';
    }

    getInfo () {
        return {
            id: 'rulo',
            name: formatMessage({
                id: 'rulo.categoryName',
                default: 'Rulo'
            }),
            showStatusButton: true,
            menuIconURI: iconURI,
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'setROSIP',
                    text: formatMessage({id: 'rulo.setROSIP', default: 'RuloのIPを [ROS_IP] に設定する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ROS_IP: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({id: 'rulo.setROSIP_Number',　default: '192.168.0.1'})
                        }
                    }
                },
                {
                    opcode: 'setRuloMode',
                    text: formatMessage({id: 'rulo.setRuloMode', default: '動作モードを [RULO_MODE] にする'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        RULO_MODE: {type: ArgumentType.STRING, menu: 'RULO_MODE', defaultValue: "マニュアルモード"}
                    }
                },
                {
                    opcode: 'pushButtonEvent',
                    text: formatMessage({id: 'rulo.pushButtonEvent', default: '[RULO_BUTTON] ボタンが押された時'}),
                    blockType: BlockType.HAT,
                    arguments: {
                        RULO_BUTTON: {type: ArgumentType.STRING, menu: 'RULO_BUTTON', defaultValue: "スタート＆ストップ"}
                    }
                },
                {
                    opcode: 'pushBumperEvent',
                    text: formatMessage({id: 'rulo.pushBumperEvent', default: '[RULO_BUMPER] バンパが押された時'}),
                    blockType: BlockType.HAT,
                    arguments: {
                        RULO_BUMPER: {type: ArgumentType.STRING, menu: 'RULO_BUMPER', defaultValue: "右"}
                    }
                },
                {
                    opcode: 'pubCmdVel',
                    text: formatMessage({id: 'rulo.pubCmdVel',　default: '前後 [VEL_VALUE]cm/秒 左右[RAD_VALUE]度/秒 で移動する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VEL_VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubCmdVel_Vel',　default: '30'})
                        },
                        RAD_VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubCmdVel_Rad', default: '0'})
                        }
                    }
                },
                {
                    opcode: 'pubOdomBaseStraight',
                    text: formatMessage({id: 'rulo.pubOdomBaseStraight', default: '[WORDS]cm 直進する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        WORDS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubOdomBaseStraight_Number',　default: '100'})
                        }
                    }
                },
                {
                    opcode: 'pubOdomBaseTurn',
                    text: formatMessage({id: 'rulo.pubOdomBaseTurn', default: '[WORDS]度回転する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        WORDS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubOdomBaseTurn_Number',　default: '90'})
                        }
                    }
                },
                {
                    opcode: 'pubStopVel',
                    text: formatMessage({id: 'rulo.pubStopVel',　default: '移動を停止する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {}
                },
                {
                    opcode: 'pubClean',
                    text: formatMessage({id: 'rulo.pubClean',　default: '吸引 [Vacuum_VALUE]% [Brush_VALUE]% で掃除する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        Vacuum_VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubClean_Vacuum',　default: '50'})
                        },
                        Brush_VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({id: 'rulo.pubClean_Brush', default: '50'})
                        }
                    }
                },
                {
                    opcode: 'pubStopCrean',
                    text: formatMessage({id: 'rulo.pubStopCrean',　default: '掃除を停止する'}),
                    blockType: BlockType.COMMAND,
                    arguments: {}
                },
                {
                    opcode: 'pubSpeech',
                    text: formatMessage({id: 'rulo.pubSpeech', default: '[WORDS] と話す'}),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        WORDS: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({id: 'rulo.pubSpeech_Word',　default: 'こんにちは'})
                        }
                    }
                },
                {
                    opcode: 'boolButton',
                    text: formatMessage({id: 'rulo.boolButton',　default: '[RULO_BUTTON] ボタンが押されているか？'}),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        RULO_BUTTON: {type: ArgumentType.STRING, menu: 'RULO_BUTTON', defaultValue: "スタート＆ストップ"}
                    }
                },
                {
                    opcode: 'boolBumper',
                    text: formatMessage({id: 'rulo.boolBumper',　default: '[RULO_BUMPER] バンパが押されているか？'}),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        RULO_BUMPER: {type: ArgumentType.STRING, menu: 'RULO_BUMPER', defaultValue: "右"}
                    }
                }
            ],
            menus: {
                RULO_BUTTON: ["スタート＆ストップ","ホーム","念入り","スポット","予約","毎日"],
                RULO_MODE: ["マニュアルモード","ノーマルモード"],
                RULO_BUMPER: ["右","左"]
            }
        }
    }//getInfo

    stopProgram () {
        this.pub_scratch_ros("rulo_cmd_vel:0,0");
        this.pub_scratch_ros("rulo_clean:0,0");
        this.pub_scratch_ros("scratch_stoped");
    }//stopProgram

    pub_scratch_ros (str){
        var data = {"data": str};
        var msg = { "op": "publish", "topic": "/scratch_ros", "msg": data };
        socket.send(JSON.stringify(msg));
        console.log('publish data : ' + str);
    };

    setROSIP (args) {
        socket = new WebSocket('ws://' + String(args.ROS_IP) + ':9090');
    }

    setRuloMode (args) {
        if(String(args.RULO_MODE) == "マニュアルモード"){
            this.pub_scratch_ros("rulo_drive_mode:manual");
        }else if(String(args.RULO_MODE) == "ノーマルモード"){
            this.pub_scratch_ros("rulo_drive_mode:normal");
        }
    }//setRuloMode

    pushButtonEvent (args) {
        if(String(args.RULO_BUTTON) == "スタート＆ストップ" && rulo_button[0] == true){
            return true;
        }else if(String(args.RULO_BUTTON) == "ホーム" && rulo_button[1] == true){
            return true;
        }else if(String(args.RULO_BUTTON) == "念入り" && rulo_button[2] == true){
            return true;
        }else if(String(args.RULO_BUTTON) == "スポット" && rulo_button[3] == true){
            return true;
        }else if(String(args.RULO_BUTTON) == "予約" && rulo_button[4] == true){
            return true;
        }else if(String(args.RULO_BUTTON) == "毎日" && rulo_button[5] == true){
            return true;
        }else{ return false; }
    }//pushButtonEvent

    pushBumperEvent (args) {
        if(String(args.RULO_BUMPER) == "右" && rulo_bumper_right_state == true){
            return true;
        }else if(String(args.RULO_BUMPER) == "左" && rulo_bumper_left_state == true){
            return true;
        }else{ return false; }
    }//pushBumperEvent

    pubCmdVel (args) {
        if(Number(args.VEL_VALUE) == 0 && Number(args.RAD_VALUE) == 0){ moving_state = false; }
        else{ moving_state = true; }
        this.pub_scratch_ros("rulo_cmd_vel:" + String(args.VEL_VALUE) + ',' + String(args.RAD_VALUE));
    }

    pubStopVel (args) {
        this.pub_scratch_ros("rulo_cmd_vel:0,0");
    }

    pubOdomBaseStraight (args) {
        moving_state = true;
        this.pub_scratch_ros("rulo_straight:" + String(args.WORDS));
    }

    pubOdomBaseTurn (args) {
        moving_state = true;
        this.pub_scratch_ros("rulo_turn:" + String(args.WORDS));
    }

    pubClean (args) {
        this.pub_scratch_ros("rulo_clean:"+String(args.Vacuum_VALUE)+','+String(args.Brush_VALUE));
    }

    pubStopCrean (args) {
        this.pub_scratch_ros("rulo_clean:0,0");
    }

    pubSpeech (args) {
        this.pub_scratch_ros("speech:" + String(args.WORDS));
    }

    boolButton (args) {
        if(String(args.RULO_BUTTON) == "スタート＆ストップ"){
            return rulo_button[0];
        }else if(String(args.RULO_BUTTON) == "ホーム"){
            return rulo_button[1];
        }else if(String(args.RULO_BUTTON) == "念入り"){
            return rulo_button[2];
        }else if(String(args.RULO_BUTTON) == "スポット"){
            return rulo_button[3];
        }else if(String(args.RULO_BUTTON) == "予約"){
            return rulo_button[4];
        }else if(String(args.RULO_BUTTON) == "毎日"){
            return rulo_button[5];
        }
    }//boolButton

    boolBumper (args) {
        if(String(args.RULO_BUMPER) == "右"){
            return rulo_bumper_right_state;
        }else if(String(args.RULO_BUMPER) == "左"){
            return rulo_bumper_left_state;
        }
    }//boolBumper
}//Scratch3RuloBlocks

module.exports = Scratch3RuloBlocks;
