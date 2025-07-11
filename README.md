
# Node Adminnnsdsds

Node Admin is a starter pack for developing NodeJs application. This application contain minimum spesification for an application.

## Features

1. User Management
2. Profile Management
3. Access Management Based on Route
4. User Role Management with Multiple Role
5. Build on NodeJs Modules
6. Build on Service Layer

## Installation
#### Clone the file to your local by typing below command:
```cmd
git clone https://github.com/NodeJsTech-Id/NodeAdmin.git
```
#### Change directory to NodeAdmin:
```cmd
cd NodeAdmin
```

#### Open Code Editor (Visual Studio Code):
```cmd
code .
```

#### Install NPM Dependencies:
```cmd
npm install
```

#### Login to your Mysql Database:
```cmd
mysql -u root -p
```

#### Create New Database:
```cmd
CREATE DATABASE nodeadmin;
```

#### Exit from Mysql Database Terminal:
```cmd
exit;
```

#### Put the config on .env file like below:
```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=12345678
DB_DATABASE=nodeadmin
DB_SYNCHRONIZE=false
DB_LOGGING=true
```

#### Hit command below:
```cmd
$ npm run migration:run
```

#### Start your application development by typing:
```cmd
$ npm run start:dev
```

#### Login to Application by below credential:
```cmd
Username: admin@admin.com
Password: 12345678
```

## License
The Node Admin is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
