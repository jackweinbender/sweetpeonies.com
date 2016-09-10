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
    content: function(){
      return toMarkdown($('.entry-content').html())
    },
    categories : function(){
      let cat = []
      $('a[rel="category tag"]').each((i, elem) => {
        cat[i] = $(elem).text()
      })
      return cat.map( e => {return "\n- " + e}).join('')
    },
    fullDate: function(){
      const d = new Date(this.date)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const day = d.getDate()
      return [year, doubleDigit(month), doubleDigit(day)].join("-")
    },
    filename: function(){
      return this.fullDate() + "-" + this.slug() + ".markdown"
    },
    printObject: function(){
      return "---" + "\n" +
        "layout: post\n" +
        "author: " + this.author + "\n" +
        "title: \"" + this.title + "\"\n" +
        "assets: /assets/images" + this.fullDate() + this.slug() + "\n" +
        "categories: " + this.categories() + "\n" +
        "---\n\n" +
        this.content()

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


function doubleDigit( num ){
  if (num <= 9){
    return "0" + num
  } else {
    return num + ""
  }
}
