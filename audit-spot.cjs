const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({headless:true});
  const pg=await b.newPage();
  await pg.setViewportSize({width:375,height:800});

  // Check 1: /courses — whitespace-nowrap table + doc overflow
  await pg.goto('http://localhost:4399/courses',{waitUntil:'domcontentloaded',timeout:15000});
  await pg.waitForTimeout(700);
  const courses=await pg.evaluate(()=>{
    const sw=document.documentElement.scrollWidth;
    const cw=document.documentElement.clientWidth;
    const table=document.querySelector('table');
    const tRect=table?table.getBoundingClientRect():null;
    const wrapper=table?table.closest('[class*="overflow-x"]'):null;
    const wRect=wrapper?wrapper.getBoundingClientRect():null;
    return {
      docSW:sw, docCW:cw, docOverflow:sw>cw, docDiff:sw-cw,
      tableFound:!!table,
      tableRight:tRect?Math.round(tRect.right):null,
      tableWidth:tRect?Math.round(tRect.width):null,
      wrapperClass:wrapper?Array.from(wrapper.classList).join(' '):'none',
      wrapperRight:wRect?Math.round(wRect.right):null
    };
  });
  console.log('1. /courses 375px');
  console.log('   doc: scrollW='+courses.docSW+' clientW='+courses.docCW+' overflow='+courses.docOverflow+(courses.docOverflow?' +'+courses.docDiff+'px OVERFLOW':''));
  console.log('   table found='+courses.tableFound+' right='+courses.tableRight+'px width='+courses.tableWidth+'px');
  console.log('   overflow-x wrapper=['+courses.wrapperClass+'] right='+courses.wrapperRight+'px');

  // Check 2: footer newsletter (check on / page which is lighter to load)
  await pg.goto('http://localhost:4399/',{waitUntil:'domcontentloaded',timeout:15000});
  await pg.waitForTimeout(700);
  const footer=await pg.evaluate(()=>{
    const sw=document.documentElement.scrollWidth;
    const cw=document.documentElement.clientWidth;
    const form=document.getElementById('newsletter-form');
    const fRect=form?form.getBoundingClientRect():null;
    const input=document.getElementById('footer-email');
    const iRect=input?input.getBoundingClientRect():null;
    const btn=document.getElementById('newsletter-submit-btn');
    const bRect=btn?btn.getBoundingClientRect():null;
    return {
      docSW:sw, docCW:cw, docOverflow:sw>cw, docDiff:sw-cw,
      formRight:fRect?Math.round(fRect.right):null,
      inputRight:iRect?Math.round(iRect.right):null,
      btnRight:bRect?Math.round(bRect.right):null
    };
  });
  console.log('\n2. Footer newsletter (on /) 375px');
  console.log('   doc: scrollW='+footer.docSW+' clientW='+footer.docCW+' overflow='+footer.docOverflow+(footer.docOverflow?' +'+footer.docDiff+'px OVERFLOW':''));
  console.log('   form.right='+footer.formRight+'px  input.right='+footer.inputRight+'px  btn.right='+footer.btnRight+'px');

  await b.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
