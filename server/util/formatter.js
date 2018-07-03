module.exports = {
  obfuscateEmail (str) {
    if (typeof str === 'string') {
      const [name, emailDomain] = str.split('@')

      if (name && emailDomain) {
        const [domain, tld] = emailDomain.split('.')
        const nameLength = name.length
        const newName = name.substr(0, nameLength / 2).padEnd(nameLength, '*')
        const domainLength = domain.length
        const newDomain = domain.substr(0, domainLength / 2).padEnd(domainLength, '*')
        return `${newName}@${newDomain}.${tld}`
      }
    }

    return str
  }
}
