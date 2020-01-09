<p align="center">
    <img src="https://react.semantic-ui.com/logo.png" alt="Semantic UI React logo" align="center">
</p>

<h1 align="center">react-semantic-boilerplate</h1>

**NOTE: This project is not officially associated with Semantic UI and/or Facebook in any way. It is just a helpful boilerplate arranged by me.**

## Introduction

This is a boilerplate project that intends to provide an easy way to setup [Create React App](https://github.com/facebookincubator/create-react-app) with a customizable version of [Semantic UI](https://semantic-ui.com/), as this process is usually clumsy and full of little inconveniences.

It is based on the [Webpack 3 example](https://github.com/Semantic-Org/Semantic-UI-React/tree/master/examples/webpack3) provided by the Semantic UI folks, with a bunch of opinionated changes.

## What's included

:heavy_check_mark: Direct module imports to reduce bundle size  
:heavy_check_mark: Hot module reloading  
:heavy_check_mark: SEO optimizations (incl. Open Graph, Twitter and Google)  
:heavy_check_mark: The beautiful Inter UI font  
:heavy_check_mark: Semantic UI React (duh!)  
:heavy_check_mark: Tachyons for easy layouting

## How to use

### Installation

First clone the repository to your computer by running  
`git clone https://github.com/pretzelhands/react-semantic-boilerplate.git`

Then you need to install the required dependencies with  
`yarn install` (**npm:** `npm install`)

And after that you are ready to go!

### Basic usage

You can now use the same commands as with any other Create React App! They are as follows:

`yarn start` (**npm:** `npm run start`)  
`yarn build` (**npm:** `npm run build`)

They function exactly the same way as you're used to, but include Semantic UI compilation on-the-fly and hot module reloading.

### Customizing Semantic UI

To customize Semantic UI you can find the appropriate files in `src/styling/theme`. To understand the file structure provided in that folder, please read the [Customization Guide](http://learnsemantic.com/developing/customizing.html) provided by Semantic UI.

The theme files are pre-filled with all available variables so you can just set them and forget them. As you save those files Webpack will automatically rec-compile your files.

### Customize the SEO optimizations

This boilerplate includes all tags to make your app look great when you share it on Facebook, Twitter, or wherever else. For this purpose I included various meta tags which you can customize as follows:

* Rename `.env.example` to `.env`
* Update the variables you see in `.env` - these are used for the base url for loading the assets, the page title, the meta description, the theme color for Android and the correct site for Twitter.
* After that generate the necessary files on [realfavicongenerator.net](https://realfavicongenerator.net/) and copy the files to the `public/assets` directory
* Make custom images for `twitter-card.png`, `open-graph.png` and `social.png` - They are all provided in the recommended sizes.

And you're done! Your application/site is now optimized for sharing on social media and other places! :tada:

## Contributing

Contributions in any form are welcome! If you find a bug, please [file an issue.](https://github.com/pretzelhands/react-semantic-boilerplate/issues) All contributors are asked to abide by the rules of the [Contributor Covenant.](./CODE_OF_CONDUCT.md)

## Updates

This repo will be kept up-to-date in accordance with the stable releases of React, Create React App, Semantic UI and Semantic UI React insofar they are compatible.

If major changes happen to the Webpack 3 example of the Semantic UI React repository, I will reflect them in this repository.

## License

This project is licensed under the ISC license. See the [LICENSE file](./LICENSE.md) for more details.