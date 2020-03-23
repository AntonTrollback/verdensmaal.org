var html = require('choo/html')
var Component = require('choo/component')
var asElement = require('prismic-element')
var view = require('../components/view')
var grid = require('../components/grid')
var form = require('../components/form')
var intro = require('../components/intro')
var Anchor = require('../components/anchor')
var banner = require('../components/banner')
var button = require('../components/button')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

var text = i18n()
var CATEGORY_COLORS = {
  ildsjæleprisen: 11,
  forandringsprisen: 6,
  inkluderingsprisen: 4
}

module.exports = view(nomination, meta)

function nomination (state, emit) {
  var opts = {
    fetchLinks: ['page.title', 'page.description']
  }
  return state.docs.getByUID('page', 'nominer-en-helt', opts, function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <div class="View-spaceLarge">
            <div class="u-container">${intro.loading()}</div>
          </div>
        </main>
      `
    }

    var title = asText(doc.data.title)
    var description = asElement(doc.data.description)
    var body = asElement(doc.data.body, resolve, serialize)
    var counter = state.cache(Counter, 'motivation-counter')
    var { fields, error } = state.nomination

    if (doc.data.related.length) {
      var categories = doc.data.related[0].items.filter(function (item) {
        return item.link.id && !item.link.isBroken
      })
    }

    return html`
      <main class="View-main">
        <div class="View-spaceLarge">
          ${doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="u-container">${intro({ title, body: description })}</div>
          `}
          ${doc.data.image.url ? html`
            <div class="View-space">
              <div class="Text">
                <h1>${title}</h1>
                <p>${description}</p>
              </div>
            </div>
          ` : null}
          <div class="View-space u-container">
            <div class="Text">
              ${body}
            </div>
            ${categories && categories.length ? content() : null}
          </div>
        </div>
      </main>
    `

    function onchange (event) {
      emit('nomination:set', event.target.name, event.target.value)
    }

    function oninput (event) {
      counter.render(event.target.value)
    }

    function onsubmit (event) {
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
        event.preventDefault()
        return
      }
      emit('nomination:submit')
      event.preventDefault()
    }

    function content () {
      switch (state.nomination.phase) {
        case 'vote': return button({
          large: true,
          primary: true,
          text: 'Til afstemningen',
          href: resolve(categories[0].link)
        })
        case 'nomination': {
          return html`
            <form action="/api/nomination" method="POST" class="Form" onsubmit=${onsubmit}>
              ${error ? html`
                <div class="Form-error u-spaceB6">
                  ${state.cache(Anchor, 'nomination-error', { auto: true }).render()}
                  <div class="Text">
                    <h2 class="Text-h3">${text`Oops`}</h2>
                    <p>${text`Something seems to be missing. Please make sure that you have filled in all requried fields (marked with a *).`}</p>
                    ${process.env.NODE_ENV === 'development' ? html`<pre>${error.stack}</pre>` : null}
                  </div>
                </div>
              ` : null}
              <div class="Text u-spaceB4">
                <h2 class="Text-h3">Vælg en kategori</h2>
                <p>Hvilken pris har din kandidat gjort sig fortjent til?</p>
              </div>
              ${grid({ size: { lg: '1of3' } }, categories.map(function ({ link }, index) {
                var value = asText(link.data.title)
                return form.choice({
                  id: `category-${link.id}`,
                  value: value,
                  disabled: state.nomination.loading,
                  selected: fields['entry.57699070'],
                  name: 'entry.57699070',
                  class: `u-bg${CATEGORY_COLORS[link.uid] || 4}`,
                  label: value,
                  description: asText(link.data.description)
                }, onchange)
              }))}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Fortæl os om dig selv</h2>
              </div>
              ${grid({ size: { md: '1of2', lg: '1of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Dit navn',
                      value: fields['entry.1816023571'] || '',
                      id: 'entry.1816023571',
                      name: 'entry.1816023571',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                    ${form.input({
                      label: 'E-mail',
                      value: fields['entry.979846681'] || '',
                      id: 'entry.979846681',
                      name: 'entry.979846681',
                      type: 'email',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                  </div>
                `, html`
                  <div>
                    ${form.input({
                      label: 'Din organisation/virksomhed',
                      value: fields['entry.1490561457'] || '',
                      id: 'entry.1490561457',
                      name: 'entry.1490561457',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                  </div>
                `
              ])}
              <div class="Text u-spaceT8 u-spaceB4">
                <h2 class="Text-h3">Fortæl os om den du vil nominere</h2>
              </div>
              ${grid({ size: { md: '1of2', lg: '1of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Navn',
                      value: fields['entry.2012872212'] || '',
                      id: 'entry.2012872212',
                      name: 'entry.2012872212',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                    ${form.input({
                      label: 'E-mail',
                      value: fields['entry.208355292'] || '',
                      id: 'entry.208355292',
                      name: 'entry.208355292',
                      type: 'email',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                  </div>
                `, html`
                  <div>
                    ${form.input({
                      label: 'Organisation/virksomhed',
                      value: fields['entry.682921765'] || '',
                      id: 'entry.682921765',
                      name: 'entry.682921765',
                      required: true,
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                    ${form.input({
                      label: 'Telefonnummer',
                      value: fields['entry.1204891467'] || '',
                      id: 'entry.1204891467',
                      name: 'entry.1204891467',
                      type: 'tel',
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                  </div>
                `
              ])}
              ${form.textarea({
                rows: 10,
                class: 'u-spaceB1',
                label: 'Hvorfor skal din kandidat nomineres til prisen?',
                value: fields['entry.1264591994'] || '',
                id: 'entry.1264591994',
                name: 'entry.1264591994',
                required: true,
                oninput: oninput,
                onchange: onchange,
                disabled: state.nomination.loading,
                comment: 'Beskriv hvad personen har gjort, hvem målgruppen er og hvad effekten har været samthvordan Verdensmålene har været med i arbejdet. (Max 300 ord)'
              })}
              ${counter.render(fields['entry.1264591994'])}
              <div class="Text u-spaceT8 u-spaceB2">
                <h2 class="Text-h3">Relevante links</h2>
                <p>Indsæt meget gerne links til kandidatens hjemmeside, sociale medier eller f.eks. presseomtale af projektet/kandidaten.</p>
              </div>
              ${grid({ size: { lg: '2of3' } }, [
                html`
                  <div>
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      class: 'u-spaceB1',
                      placeholder: 'Indsæt link her',
                      value: fields['entry.1030183847'] || '',
                      id: 'entry.1030183847',
                      name: 'entry.1030183847',
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      class: 'u-spaceB1',
                      placeholder: 'Paste link here',
                      value: fields['entry.1272236586'] || '',
                      id: 'entry.1272236586',
                      name: 'entry.1272236586',
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                    ${form.input({
                      label: 'Link',
                      plain: true,
                      class: 'u-spaceB1',
                      placeholder: 'Paste link here',
                      value: fields['entry.2039565048'] || '',
                      id: 'entry.2039565048',
                      name: 'entry.2039565048',
                      onchange: onchange,
                      disabled: state.nomination.loading
                    })}
                  </div>
                `
              ])}
              <div class="u-flex u-flexWrap u-alignCenter">
                <div class="u-spaceR3 u-spaceT6">
                  ${button({ type: 'submit', text: text`Indsend`, primary: true, disabled: state.nomination.loading })}
                </div>
                <div class="Text Text-small u-spaceT6">
                  <div class="Text-muted">
                    <p>Ved at indsende disse oplysninger<br>accepterer du vores <a href="https://verdensbedstenyheder.dk/om-verdens-bedste-nyheder/persondatapolitik/" rel="noreferrer noopener" target="_blank">vilkår og betingelser</a>.</p>
                  </div>
                </div>
              </div>
            </form>
          `
        }
        default: return null
      }
    }
  })
}

// word counter component
// () -> Counter
class Counter extends Component {
  update () {
    return true
  }

  createElement (value = '') {
    var length = value ? value.split(' ').length : '0'
    return html`<span class="Form-meta">${text`${length}/${300} words`}</span>`
  }
}

// construct image properties
// obj -> obj
function image (props) {
  return {
    width: props.dimensions.width,
    height: props.dimensions.height,
    caption: props.copyright,
    alt: props.alt || '',
    src: props.url,
    sizes: '100vw',
    srcset: srcset(
      props,
      [400, 600, 900, 1800, [3000, 'q_60']],
      { aspect: 9 / 16 }
    )
  }
}

function meta (state) {
  return state.docs.getByUID('page', 'nominer-en-helt', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url || doc.data.image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
