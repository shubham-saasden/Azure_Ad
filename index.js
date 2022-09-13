const express=require('express');
const axios=require('axios');
const qs = require('qs');
const path=require(`path`);
const app=express();
require('dotenv').config();
const ejsMate=require('ejs-mate')
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
const port=8080;
const TOKEN_ENDPOINT=`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/token`;
const APP_ID = `${process.env.CLIENT_ID}`;
const APP_SECERET = `${process.env.CLIENT_SECRET}`;
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
async function users() {
  const  token =await axios.post(
     `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
     new URLSearchParams({
         'client_id': APP_ID,
         'scope':  `${MS_GRAPH_SCOPE}`,
         'client_secret': APP_SECERET,
         'grant_type': 'client_credentials'
     })
 ).then(res=>{return res.data.access_token}).catch(res=>console.log(res));
app.get('/',(req,res)=>{
    res.render(`index`);
});
// console.log(token);

let newApp=new Object();

app.get('/apps', async (req,res)=>{
const apps = await axios.get('https://graph.microsoft.com/v1.0/applications', {
  headers: {
      'Authorization': `Bearer ${token}`
  }
}).then(res=>{return res.data.value}).catch(res=>console.log(res));
const len_apps=apps.length;
const finalAppDetails=[]
for (let i=0;i<len_apps;i++) {
    const {appId,displayName}=apps[i];
    const users=[];
    var len_user=apps[i].appRoles.length;
    for(let j=0;j<len_user;j++)
    {
        const {id,displayName}=apps[i].appRoles[j]
        const userObject={userID:id,userName:displayName}
        users.push(userObject)
    }
    const appObject={appID:appId,appName:displayName,users:users}
    finalAppDetails.push(appObject)
}

console.log(finalAppDetails);
});


app.get('/users', async (req,res)=>{
  const finalUserDetails=[]
  const list = await axios.get('https://graph.microsoft.com/v1.0/users/', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}).then(res=>{return res.data.value}).catch(res=>console.log(res));
for (var i=0;i<list.length;i++){
  const {id,displayName}=list[i];
  const dat = await axios.get(`https://graph.microsoft.com/v1.0/users/${list[i].id}/appRoleAssignments`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}).then(res=>{return res.data.value}).catch(res=>console.log(res));
const apps=[];
for (var j=0;j<dat.length;j++){
  const {id,resourceDisplayName}=dat[j];
  const appsObject={appID:id,appName:resourceDisplayName}
  apps.push(appsObject);
}
const userObject={userID:id,userName:displayName,apps:apps};
finalUserDetails.push(userObject);
}
console.log(finalUserDetails);
});
}
users();

app.listen(port,console.log("running on port : ",port));