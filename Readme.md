# Brand_Monkey_Server

# Project Title

Unified Workforce Management System (UWMS)

### Project Description:
Unified Workforce Management System (UWMS) is a comprehensive Employee Management System (EMS) designed to streamline organizational processes and enhance communication across various levels of authority. With a three-tier authorization structure, UWMS provides specific functionalities tailored to the roles of Superadmin, Admin, and Employee.

#### Key Features:
#### Superadmin Authority:

Employee and Client Management: Add, edit, and delete employee and client details.
Ticket Assignment: Assign tickets generated from client-side issues to specific employees.
Service Management: Add, edit, and delete services offered by the organization.
#### Meeting Management: 
Create, edit, and view Minutes of Meetings (MOM) from client meetings.
Client Portfolio Oversight: View and edit client details, assign services to clients, and manage client relationships comprehensively.
Admin Responsibilities:

#### Ticket Management:
Assign tickets to employees and acknowledge their resolution.
Client Data Access: View client details for improved client interactions.
Meeting Management: Add MOM lists for client meetings.
No Employee or Service Management: Restricted access to adding, editing, or deleting employees, clients, or services.
Employee Functionality:

#### Task Management: 
Update and track the progress of assigned tasks.
Ticket Resolution: Resolve client issues by addressing assigned tickets.
No Client or Service Management: Limited access to client and service details, focusing on task execution.


### Benefits:

#### Enhanced Security and Control:
The three-tier authorization system ensures that each role has access to the necessary functionalities while preventing unauthorized access to critical data.

#### Improved Client Relations: 
Superadmin can comprehensively manage client interactions, ensuring a personalized and efficient service delivery process.

#### Streamlined Ticketing System: 
Admins can efficiently manage tickets, acknowledge resolutions, and track the status of client-reported issues.

#### Task Transparency for Employees: 
Employees can easily track and update their work progress, promoting accountability and efficiency.
# Deployment

To deploy this project and run on AWS with free SSL

## Installation Intruction

Deployment Instructions for EC2 Instance Setup

## Create an EC2 Instance:

After successfully creating an EC2 instance, navigate to the AWS Management Console.
Click on the Instances section and find your newly created instance.

#### Instance Summary:
Click on the `Instance ID` to access the instance summary.
##### Connect to Instance:

On the instance summary page, locate the Connect button.
#### `CloudShell` Access for Windows Users:

Click `Connect` to access the "Connect to Instance" page.
On the new page, click on the `Connect` button located at the bottom.
##### `CloudShell` Access:

You will be redirected to the `CloudShell` of your EC2 instance.
## Deployment Commands:

Follow the commands below in `CloudShell` for a successful deployment:
Install node version manager (nvm) by typing the following at the command line.
```bash
    #to become a root user
    sudo su -
```
```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```
#### Activate nvm by typing the following at the command line.
```bash
    . ~/.nvm/nvm.sh
```
Use nvm to install the latest version of Node.js by typing the following at the command line.
```bash
  nvm install node
```

### Now After Installing Node Lets Move To Installing Git In Our EC2 Server

##### To install git, run below commands in the terminal window:

```bash
  sudo apt-get update -y
```
```bash
  #sudo apt upgrade
  #sudo apt upgrade
  #sudo apt install -y git htop wget
  #well you don't have to get htop or wget until necessary so : 
  sudo apt-get install git -y
```
now to ensure that git is installed type the follwing command:
```bash
  git --version
```
This command will print the git version in the terminal.

Now Clone Your Server Repository where you have your server code

```bash
  git clone https://github.com/clone-your-repo
```

now change the directory to your cloned folder or directory and install the packages in your `package.json` file: 
```bash
  cd Brand_Monkey_Server
```
```bash
  npm install
```
to run the server:
```bash
  node app.js
```
###  Install pm2
```bash
  npm install -g pm2
```

#### Starting the app with pm2 (Run nodejs in background and when server restart)
```bash
  pm2 start app.js
```
```bash
  pm2 save
```
the above command # saves the running processes
                  # if not saved, pm2 will forget
                  # the running apps on next boot

#### If you want pm2 to start on system boot : 
```bash
  pm2 startup # starts pm2 on computer boot
```

Now all the steps required to run the server on EC2 is completed.


## Install Nginx For Proxy Setup And For Free SSL

```bash
sudo apt install nginx
```
```bash
sudo nano /etc/nginx/sites-available/default
```
### Add the following to the location part of the server block

##### before setting it up make sure you do not change anything but the `location` part:
```bash
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:8800; #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

##### check nginx config and restart it if no error occur :
```bash
sudo nginx -t
```
```bash
sudo service nginx restart
```

#### Obtain and Install SSL Certificate

##### Installing Certbot

##### Use Let's Encrypt to obtain a free SSL certificate with Certbot:
```bash 
sudo apt install certbot python3-certbot-nginx
```
##### Run Certbot to obtain the SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d subdomain.yourdomain.com
```
#### Configure Nginx for SSL
##### Modify the Nginx configuration to use SSL:
```bash
sudo nano /etc/nginx/sites-available/default
```
##### Update the configuration to include SSL settings:
```bash
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        # Your Nginx configuration goes here
    }
}
```

#### You should now be able to visit your IP with no port (port 80) and see your app. Now let's add a domain

#### This step is to point your ip address from the domain
     ->Check that Port 80 redirect to Nodejs server

confirm it by the same testing command
```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

Now you have successfully applied the SSL to your domain

#### The last step is to set the certbot for auto-renewal

```bash
sudo systemctl status snap.certbot.renew.service
```
##### Check the crontab for Certbot's auto-renewal job:

##### Certbot usually adds a cron job or a systemd timer to handle the renewal process. You can check if it exists by running:
```bash
sudo crontab -u root -l
```
##### You should see something like this:
```bash
0 */12 * * * /usr/bin/certbot renew --quiet
```

##### If it's not set up, you can manually edit the cron job:
```bash
sudo crontab -u root -e
```
##### Add the following line to restart Nginx after renewal:
```bash
0 */12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl restart nginx"
```

To test the renewal process, you can do a dry run with certbot:

```bash
sudo certbot renew --dry-run
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

##### For MongoDB Connection
`MONGODB_URI`

##### For jwt
`SECRET_KEY`

##### For SendGrid Email
`SENDGRID_API_KEY`

#### S3 CREDENTIALS
`SECRET_ACCESS_KEY`

`ACCESS_KEY`

`BUCKET_NAME`

`BUCKET_REGION`


## Tech Stack

**Client:** React JS, Context API, TailwindCSS, interceptors, axios, mui

**Server:** Node, Express, Bcrypt, jsonwebtoken, MongoDB, Mongoose

