const filepaths = require('filepaths')
const fs = require('fs')
const cheerio = require('cheerio')
const toMarkdown = require('to-markdown');

const post = (data) => {
  const $ = cheerio.load(data)
  return {
    title: $('h1.entry-title').text(),
    slug: function(){
      const url = $('link[rel=canonical]').attr('href').split("/")
      return url[5]
    },
    date : $('time.entry-date').attr('datetime'),
    author : $('a[rel=author]').text(),
    categories : function(){
      let cat = []
      $('a[rel="category tag"]').each((i, elem) => {
        cat[i] = $(elem).text()
      })
      return cat
    },
    filename: function(){
      const d = new Date(this.date)
      return [d.getFullYear(), d. getMonth() + 1, d.getDate() , this.slug()].join("-") + ".markdown"
    },
    printObject: function(){
      return "---" + "\n" +
        "author: " + this.author + "\n" +
        "title: " + this.title + "\n" +
        "categories: " + this.categories() + "\n"

    }
  }
}

var paths = ['2011', '2012', '2013'].map( path => { return '_content/' + path })

var posts = filepaths
  .getSync(paths)
  .map((file) => {
    file = file.split("/")
    return file
  })
  .filter((file) => {
    return file[5] === 'index.html'
  })
  .map((file) => {
    file = file.join("/")
    return file
  })
  .map( file => {
    return fs.readFileSync(file, 'utf8')
  })
  .map( data => {
    return post(data)
  })

posts.forEach( p => {
  fs.writeFile('_posts/' + p.filename(), p.printObject() )
})
