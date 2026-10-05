import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({
 site: 'https://lambdawalker.github.io', base: '/android.apexfission.math.coordinates',
 integrations: [starlight({title:'Apexfission Coordinates',description:'Pixel geometry, normalized coordinates, and explicit frame transformations.',components:{Banner:'./src/components/VersionBanner.astro'},customCss:['./src/styles/brand.css'],social:[{icon:'github',label:'GitHub',href:'https://github.com/lambdawalker/android.apexfission.math.coordinates'}],sidebar:[
  {label:'Overview',slug:'index'}, {label:'Installation',slug:'installation'}, {label:'First transformation',slug:'getting-started'},
  {label:'Coordinate spaces',slug:'concepts'}, {label:'Recipes and runnable demos',slug:'task-recipes'}, {label:'API reference',slug:'reference'},
  {label:'Limitations',slug:'limitations'}, {label:'Troubleshooting',slug:'troubleshooting'}, {label:'Version scope',slug:'migration'},
  {label:'Agent integration',slug:'agents'}, {label:'Documentation maintenance',slug:'development'}, {label:'Build and release',slug:'releases'}
 ]})]
});
