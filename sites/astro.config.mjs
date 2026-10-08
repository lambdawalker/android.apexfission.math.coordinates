import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({
 site: 'https://lambdawalker.github.io', base: '/android.apexfission.math.coordinates',
 integrations: [starlight({title:'Apexfission Coordinates',description:'Pixel geometry, normalized coordinates, and explicit frame transformations.',components:{Banner:'./src/components/VersionBanner.astro',Sidebar:'./src/components/VersionSidebar.astro',Head:'./src/components/VersionHead.astro',LanguageSelect:'./src/components/EmptyLanguageSelect.astro'},defaultLocale:'en',locales:{en:{label:'English',lang:'en'},es:{label:'Español',lang:'es'}},customCss:['./src/styles/brand.css'],social:[{icon:'github',label:'GitHub',href:'https://github.com/lambdawalker/android.apexfission.math.coordinates'}],sidebar:[]})]
});
