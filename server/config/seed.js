const mongoose = require('mongoose')
const uid = require('uid-safe')

const { dbConnString } = require('../config')
const log = require('../config/log')
const Permission = require('../models/permission')
const PermissionModules = require('../models/permission/modules')
const Role = require('../models/role')
const User = require('../models/user')

const pino = log.child({ path: 'config/seed' })
const Roles = {
  ADMIN: 'admin',
  USER: 'user'
}

mongoose.Promise = global.Promise
mongoose.connect(dbConnString, {
  config: {
    autoIndex: false,
    reconnectTries: 60 * 60 * 24,
    reconnectInterval: 1000
  },
  useNewUrlParser: true
})
mongoose.connection
  .on('connected', async () => {
    pino.info("Let's seed the database with default values")
    await Promise.all([
      createRoles(),
      createPermissions(),
      createUsers()
    ])
    mongoose.connection.close()
  })
  .on('error', (err) => {
    pino.error('Unable to seed database due to database error', err)
    mongoose.connection.close()
  })

// Insert default roles
async function createRoles () {
  const roles = [
    {
      name: Roles.ADMIN,
      sequence: 1
    },
    {
      name: Roles.USER,
      sequence: 2
    }
  ]
  return Role.insertMany(roles, (err, docs) => {
    if (err) {
      pino.error(err)
    } else {
      pino.info(`${docs.length} roles inserted successfully`)
    }
  })
}

// Insert default permissions
async function createPermissions () {
  const permissions = [
    {
      module: PermissionModules.NOTES,
      action: 'listNotes',
      name: 'List Notes',
      description: 'Ability to list all notes',
      grants: Object.values(Roles)
    },
    {
      module: PermissionModules.NOTES,
      action: 'createNote',
      name: 'Add Note',
      description: 'Ability to add a new note',
      grants: Object.values(Roles)
    },
    {
      module: PermissionModules.NOTES,
      action: 'readNote',
      name: 'View Note',
      description: 'Ability to view an existing note',
      grants: Object.values(Roles)
    },
    {
      module: PermissionModules.NOTES,
      action: 'updateNote',
      name: 'Update Note',
      description: 'Ability to update an existing note',
      grants: Object.values(Roles)
    },
    {
      module: PermissionModules.NOTES,
      action: 'deleteNote',
      name: 'Remove Note',
      description: 'Ability to remove an existing note',
      grants: Object.values(Roles)
    },
    {
      module: PermissionModules.USERS,
      action: 'listUsers',
      name: 'List Users',
      description: 'Ability to list all users',
      grants: [Roles.ADMIN]
    },
    {
      module: PermissionModules.USERS,
      action: 'createUser',
      name: 'Add User',
      description: 'Ability to add a new user',
      grants: [Roles.ADMIN]
    },
    {
      module: PermissionModules.USERS,
      action: 'readUser',
      name: 'View Note',
      description: 'Ability to view an existing user',
      grants: [Roles.ADMIN]
    },
    {
      module: PermissionModules.USERS,
      action: 'updateUser',
      name: 'Update User',
      description: 'Ability to update and existing user',
      grants: [Roles.ADMIN]
    },
    {
      module: PermissionModules.USERS,
      action: 'deleteUser',
      name: 'Remove User',
      description: 'Ability to remove an existing user',
      grants: [Roles.ADMIN]
    }
  ]
  return Permission.insertMany(permissions, (err, docs) => {
    if (err) {
      pino.error(err)
    } else {
      pino.info(`${docs.length} permissions inserted successfully`)
    }
  })
}

// Insert default users
async function createUsers () {
  const users = []
  const password = 'Test1234'
  let salt = uid.sync(24)
  let user = {
    name: 'Admin User',
    email: 'admin@email.com',
    password: User.encryptPassword(password, salt),
    salt,
    role: Roles.ADMIN
  }
  users.push(user)
  salt = uid.sync(24)
  user = {
    name: 'Normal User',
    email: 'user@email.com',
    password: User.encryptPassword(password, salt),
    salt,
    role: Roles.USER
  }
  users.push(user)
  return User.insertMany(users, (err, docs) => {
    if (err) {
      pino.error(err)
    } else {
      pino.info(`${docs.length} users inserted successfully`)
    }
  })
}
