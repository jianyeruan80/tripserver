var mongoose = require('mongoose');
var log = require('./logs');
var dbIpAddress = process.env.MONGO_PORT_27017_TCP_ADDR || 'mongo';
var dbPort =  '27017';
 mongoose.connect('mongodb://' + dbIpAddress + ':' + dbPort + '/tripDb', function(err) {
    if(err) {
        log.info('connection error', err);
    } else {
        log.info('DB connection successful');
    }
});
module.exports=mongoose;
/*
文件映射：docker run -d --name data -v c:\jayruanwork\app:/usr/share/app busybox   ||   docker run -d --name data -v /home/jayruanwork/app:/usr/share/app busybox [app/node,app/nginx]
Mongo:    docker run -it --volumes-from=data --name mongo -p 27017:27017 jianyeruan/mongo /run.sh mongod --port 27017 --dbpath /data
Node：
		  docker run -it --volumes-from=data --name=nodejs -p 3003:3003 --link mongo:mongo -e APPPATH="LaundryServer" jianyeruan/node /run.sh supervisor app.js
		  docker run -it --volumes-from=data  --link mongo:mongo -e APPPATH="LaundryServer" --rm jianyeruan/node /run.sh node modules/createSuper.js
Nginx
docker run -d --name=nginx -p 80:80 -p 90:90 --volumes-from=data -v c:\jayruanwork\config\nginx:/etc/nginx/conf.d nginx

docker exec -it mongo sh -c 'exec mongo --port 27019'  
*/