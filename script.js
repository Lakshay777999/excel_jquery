const { val } = require("cheerio/lib/api/attributes");
let $ = require("jquery");
let fs=require("fs");
//let dialog = require("electron/main").
let dialog = require("electron").remote.dialog;


$(document).ready(function () {
    let sheetsdb=[];
    let db;
    let lsc;
    $(".cell").on('click',function(){
        let rid=Number($(this).attr("rid"));
        let cid=Number($(this).attr("cid"));
       let address= String.fromCharCode(65+cid)+(rid+1);
       console.log(address);
       $("#formula").val(db[rid][cid].formula);

       $("#address").val(address);
        
    })
    $(".cell").on("keyup", function () {
        // height of cell
        let ht = $(this).height();
        let l = $(this).attr("rid");
      $(`.left-col-cell[cid=${l}]`).height(ht);
        
      });

    $(".content").on("scroll", function () {
        let topOffset = $(this).scrollTop();
        let leftOffset = $(this).scrollLeft();
        //  console.log(`Top => ${topOffset}`);
        //  console.log(`Left => ${leftOffset}`);
        $(".top-row , .top-left-cell").css("top", topOffset + "px");
        $(".left-col , .top-left-cell").css("left", leftOffset + "px");
      });
    $("#formula").on('blur',function(){
        let formula=$(this).val();
      
       // db update
       let address=$("#address").val();
       let{rid,cid}=getcolidrowid(address);
       let cellobject=db[rid][cid];
       
       if( db[rid][cid].formula!=formula)
       {
        removeFormula(db[rid][cid]);
        let value= solveFormula(formula,cellobject);
          
       db[rid][cid].value=value;
       db[rid][cid].formula=formula;
       
       updatechildrens(cellobject);
       //ui update
       $(lsc).text(value);
       }


    })
    $('.file').on('click',function(){
        $(".file").addClass("active-menu");
        $(".home").removeClass('active-menu')
        $('.file-menu-options').addClass('active');
        $('.home-menu-options').removeClass('active');



    })
    $('.home').on('click',function(){
        $(".file").removeClass("active-menu");
        $(".home").addClass('active-menu')
        $('.file-menu-options').removeClass('active');
        $('.home-menu-options').addClass('active');

        
    })
    $('.new').on('click',function(){
        db=[];
        for(let i=0;i<100;i++)
        {
            let row=[];
            for(let j=0;j<26;j++)
            {
                let address= String.fromCharCode(65+j)+(i+1);
                let cellobj={
                    name:address,
                    value:"",
                    formula:"",
                    parents:[],
                    childrens:[],
                    cellFormatting:{ bold:false , underline:false , italic:false },
                    cellAlignment : "center",
                    fontSize : "16px",
                    textColor : "black",
                    background : "white"
                }
                row.push(cellobj);
                $(`.cell[rid=${i}][cid=${j}]`).html("");
            }
            db.push(row);
          

        }
        console.log(db);


    })
    $('.open').on('click',function(){
        let path=dialog.showOpenDialogSync();
        let filepath=path[0];
        let data=fs.readFileSync(filepath);
        db=JSON.parse(data);

        for(let i=0;i<100;i++)
        {
            for(let j=0;j<26;j++)
            {
                let cellobject=db[i][j];
                $(`.cell[rid=${i}][cid=${j}]`).text(cellobject.value);
                
                $(cell[j]).css("font-family" , `${db[i][j].fontName}`);
                $(cell[j]).css("font-weight" , db[i][j].cellFormatting.bold ? "bold" : "normal");
                $(cell[j]).css("font-style" , db[i][j].cellFormatting.italic ? "italic" : "normal");
                $(cell[j]).css("text-decoration" , db[i][j].cellFormatting.underline ? "underline" : "none");
                $(cell[j]).css("text-align" , `${db[i][j].cellAlignment}`);
                $(cell[j]).css("font-size" , `${db[i][j].fontSize}`);
                $(cell[j]).css("color" , `${db[i][j].textColor}`);
                $(cell[j]).css("background" , `${db[i][j].background}`);
            }
        }

    })
    $('.save').on('click',function(){
        let path = dialog.showSaveDialogSync();
        if(!path)
        {
            console.log("Please choose path")
        }
        let j=JSON.stringify(db);
        fs.writeFileSync(path,j);
        alert("File saved......");
     
    })

    $(".add").on("click",function(){
        $(".sheet-list .sheet.active-sheet").removeClass("active-sheet");
        let sheet=` <div class="sheet active-sheet" sid="${sheetsdb.length}">sheet ${sheetsdb.length+1}</div>`
        $(".sheet-list").append(sheet);
        $(".sheet.active-sheet").on("click",function(){
            let hasclass=$(this).hasClass("active-sheet");
            console.log(hasclass);
            if(!hasclass)
            {
                $(".sheet.active-sheet").removeClass("active-sheet");
                $(this).addClass("active-sheet");
                 let sid=Number($(this).attr("sid"));
            db=sheetsdb[sid];

        for(let i=0;i<100;i++)
        {
            for(let j=0;j<26;j++)
            {
                let cellobject=db[i][j];
                $(`.cell[rid=${i}][cid=${j}]`).text(cellobject.value);
                
            }
        }
    
            }
        })
       
        $("#address").text("");
        init();
        for(let i=0;i<100;i++)
        {
            for(let j=0;j<26;j++)
            {
                $(`.cell[rid=${i}][cid=${j}]`).html("");
            }
        }
    })
    $(".sheet").on("click",function(){
        let hasclass=$(this).hasClass("active-sheet");
        console.log(hasclass);
        if(!hasclass)
        {
            $(".sheet.active-sheet").removeClass("active-sheet");
            $(this).addClass("active-sheet");

            let sid=Number($(this).attr("sid"));
            db=sheetsdb[sid];

        for(let i=0;i<100;i++)
        {
            for(let j=0;j<26;j++)
            {
                let cellobject=db[i][j];
                $(`.cell[rid=${i}][cid=${j}]`).text(cellobject.value);
            }
        }

          

        }
    })
    $("#bold").on("click",function(){

        let cellObj = getCellobj(lsc);
        $(lsc).css("font-weight", cellObj.cellFormatting.bold ? "normal" : "bold");
        cellObj.cellFormatting.bold = ! cellObj.cellFormatting.bold; 
    

    })

    $("#underline").on("click",function(){
        let cellObj = getCellobj(lsc);
        $(lsc).css("font-style", cellObj.cellFormatting.italic ? "normal" : "italic");
        cellObj.cellFormatting.italic = ! cellObj.cellFormatting.italic; 

    })
    $("#italic").on("click",function(){
        let cellObj = getCellobj(lsc);
        $(lsc).css("text-decoration", cellObj.cellFormatting.underline ? "none" : "underline");
        cellObj.cellFormatting.underline = ! cellObj.cellFormatting.underline; 

    })
 
    function solveFormula(formula,cellobject)
    {
        let fcomponents=formula.split(" ");
        for(let i=0;i<fcomponents.length;i++)
        {
            let fcom=fcomponents[i];
            //fcom=A1;
            let cellName=fcom[0];
            if(cellName>='A'&&cellName<='Z')
            {
                let{rid,cid}=getcolidrowid(fcom);

                let parentcellobject=db[rid][cid];
                let value=parentcellobject.value;
                //add self to parents childrens;
                if(cellobject)
                {
                addselftoparentschildren(cellobject,parentcellobject);
                
                //update parents of cell
                updateparentscell(cellobject,fcom);
                }
               

                formula=formula.replace(fcom,value);
                 console.log(formula);

            }

           

           

        }
         //formula (10+20)
         let value=eval(formula);
         return value;

    }
    function addselftoparentschildren(cellobject,parentcellobject)
    {
        parentcellobject.childrens.push(cellobject.name);
    }
    function updateparentscell(cellobject,fcom)
    {
        cellobject.parents.push(fcom);
    }



    $(".cell").on('blur',function(){
        lsc=this;
        let val=Number($(this).text());
        let rid=Number($(this).attr("rid"));
        let cid=Number($(this).attr("cid"));
        if(db[rid][cid]!=val)
        {
           
        db[rid][cid].value=val;
        console.log(db[rid][cid]);
        if (db[rid][cid].formula) {
            removeFormula(db[rid][cid]);
            $("#formula").val("");
          }
          updatechildrens(  db[rid][cid]);
        }

        
    })
    $(".alignment input").on("click", function(){
        let cellObj = getCellobj(lsc);
        let value = $(this).attr("class")
        $(lsc).css("text-align", value);
        cellObj.cellAlignment = `${value}`; 
    
    })

$("#fontsize").on("click", function(){

    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("font-size", `${value}px`);
    cellObj.fontSize = `${value}`; 

})
$("#font").on("click", function(){

    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("font-family", value);
    cellObj.fontName = `${value}`; 

})
$("#fontcolor").on("click", function(){
    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("color", value);
    cellObj.textColor = `${value}`; 

})

$("#cellcolor").on("click", function(){
    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("background", value);
    cellObj.background = `${value}`; 

})
    function removeFormula(cellobj) {
        // value , formula , parents
        // loop on parents
        // remove yourself from parents childrens
        cellobj.formula="";
        for(let i=0;i<cellobj.parents.length;i++)
    {
        let parentname=cellobj.parents[i];
        let{rid,cid}=getcolidrowid(parentname);
        let parentcellobject=db[rid][cid];
        let filteredchild=parentcellobject.childrens.filter(function(child){
            return child!=cellobj.name;
        })
        parentcellobject.childrens=filteredchild;

    }


       cellobj.parents=[];
       $("#formula-input").val("");
      }
    function updatechildrens(cellobject)
    {
        for(let i=0;i<cellobject.childrens.length;i++)
        {
            let child=cellobject.childrens[i];
            let{rid,cid}=getcolidrowid(child);
            let childcellobj=db[rid][cid];
            let value=solveFormula(childcellobj.formula);
            console.log(value);
            childcellobj.value=value+"";
            $(` .cell[rid=${rid}][cid=${cid}]`).html(value);
            updatechildrens(childcellobj);

        }

    }


///utility functions
function getcolidrowid(address)
{
    let cid=Number(address.charCodeAt(0))-65;
    let rid=Number(address.substring(1))-1;
    return {
        cid:cid,
        rid:rid
    }
}

function getCellobj(ele){
    let rid = Number($(ele).attr("rid"));
    let cid = Number($(ele).attr("cid"));
    return db[rid][cid]
}



    function init()
    {
       let newdb=[];
        for(let i=0;i<100;i++)
        {
            let row=[];
            for(let j=0;j<26;j++)
            {
                let address= String.fromCharCode(65+j)+(i+1);
                let cellobj={
                    name:address,
                    value:"",
                    formula:"",
                    parents:[],
                    childrens:[],
                    cellFormatting:{ bold:false , underline:false , italic:false },
                    cellAlignment : "center",
                    fontSize : "16px",
                    textColor : "black",
                    background : "white"
                }
                row.push(cellobj);
               // $(`.cell[rid=${i}][cid=${j}]`).text("");
            }
            newdb.push(row);
         

        }
        db=newdb;
        sheetsdb.push(db);
        console.log(sheetsdb);

    }
    init();
})