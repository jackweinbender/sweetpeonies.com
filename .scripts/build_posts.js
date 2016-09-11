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
    author : sententceCase( $('a[rel=author]').text() ),
    content: function(){
      return toMarkdown($('.entry-content').html())
    },
    categories: function(){
      let cat = []
      $('a[rel="category tag"]').each((i, elem) => {
        const category = $(elem).text()
        cat[i] = sententceCase(category)
      })
      return cat.map( e => {return "\n- " + e}).join('')
    },
    tags: function(){
      let tag = []
      $('a[rel="tag"]').each((i, elem) => {
        let t = $(elem).text().split(";")
        switch(t.length) {
          case 0:
            break;
          case 1:
            tag.push(sententceCase(t[0].trim()))
            break;
          default:
            //console.log(t)
            t.forEach( el => {
              if(el.trim().length !== 0){
                tag.push( sententceCase(el.trim()) )
              }
            })
        }
      })
      return tag.map( e => {return "\n- " + e}).join('')
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
        "assets: /assets/images/" + this.fullDate() + "-" + this.slug() + "/\n" +
        "categories: " + this.categories() + "\n" +
        "tags: " + this.tags() + "\n" +
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
  fs.writeFile('_drafts/' + p.filename(), p.printObject() )
})

function sententceCase( str ){
  return str.split(" ").map( word => {
    const arr = word.split('')
    const head = arr.shift()
    let tail = arr.slice(0)
    // console.log("arr: ", arr)
    // console.log("head: ", head)
    // console.log("tail: ", tail)

    tail.unshift(head.toUpperCase())
    return tail.join('')
  }).join(" ")
}
function doubleDigit( num ){
  if (num <= 9){
    return "0" + num
  } else {
    return num + ""
  }
}
