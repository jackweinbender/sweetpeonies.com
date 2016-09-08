var filepaths = require('filepaths')
var fs = require('fs')
let cheerio = require('cheerio')
var toMarkdown = require('to-markdown');

var paths = ['2011', '2012', '2013'].map( path => { return '_content/' + path })

var posts = filepaths
  .getSync(paths)
  .map(function(file){
    file = file.split("/")
    return file
  })
  .filter(function(file){
    return file[5] === 'index.html'
  })
  .map(function(file){
    file = file.join("/")
    return file
  })
  .forEach(function(file){
    var meta = {}
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) throw err;
      let $ = cheerio.load(data, {
        normalizeWhitespace: true
      })

      meta.title = $('h1.entry-title').text()
      meta.date = $('time.entry-date').attr('datetime')
      meta.author = $('a[rel=author]').text()
      meta.categories = []
      $('a[rel="category tag"]').each((i, elem) => {
        meta.categories[i] = $(elem).html()
      })
      meta.content = toMarkdown($('.entry-content').html());


      console.log(meta.content)
    });
  })
