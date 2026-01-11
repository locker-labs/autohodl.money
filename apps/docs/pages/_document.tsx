import Document, { Html, Head, Main, NextScript } from 'next/document'

// Custom document to wire up the favicon and any future head tags.
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" href="/ah-fav.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

