function ActualizarCaja(){
    let tot=0;
    let mod=0;
    let Suma=0;
    let billetes=["20", "50", "100", "200", "500", "1000"];
    let canBilletes=0;
    let canMonedas=0;

    for(i=0;i<=10; i++){
        if(i==0 || i==1 || i==2 || i==5 || i==10){
            let moneda = document.getElementById(`m${i}`).value;
            if(i==0){
                mod=0.5
            }else{
                mod=i;
            }
            tot= moneda*mod;
            document.getElementById(`t${i}`).innerText = `$${tot.toFixed(2)}`;
            Suma=Suma+tot;
            console.log(Suma)
        }
    }
    document.getElementById("Total_mo").innerText=Suma;
    canMonedas=Suma
    Suma=0;
    billetes.forEach(b => {
        let bi=document.getElementById(`${b}`).value;
        tot = bi*b;
        document.getElementById(`b${b}`).innerText = `$${tot.toFixed(2)}`;
        Suma=Suma+tot;
    });
    document.getElementById("Total_bi").innerText=Suma;
    canBilletes=Suma;

    let CajaTotal= canMonedas+canBilletes;
    console.log(CajaTotal);
    document.getElementById("Total_caja").innerText=CajaTotal;
}
// let resultados={"Ventas":0, "Costo de lo vendido":0,"Venta Devolución":0, "Venta Rebaja":0, "Venta Descuento":0,
//     "Gasto de compra":0,"Compra Devolución":0,"Compra Rebaja":0,  "Compra Descuento":0,
// }

let ventasNetas= Compras= GastoCompra= DevCompra= RebCompra= DesCompra=0;
let Ventas=0;
let CostoVenta= DevolVenta= RebVenta= DesVenta = 0;

let InventarioInicial=0;
let ComprasTotales=0;
let compraNeta=0;
let VentasNetas=0;
let MercanciaDisponible=0;
let InventariFinal=0;
let GastoAdmin=0;
let utilidadB;
let utilidadOp=0;
let text="---"

// "Compras",
// "Costo de le vendido",
// "",
// "",
// "",

// "",
// "",
// "Compra Descuento",   

function Resultado(){
    transacciones.forEach(t => {
        if(t.descripcion=="Ventas"){
            Ventas=t.haber;   
        }   
        if(t.descripcion=="Venta Devolución"){
            DevolVenta=t.debe;
        }
        if(t.descripcion=="Venta Rebaja"){
            RebVenta=t.debe;
        }
        if(t.descripcion=="Venta Descuento"){
            DesVenta=t.debe;
        }
        
        
        if(t.descripcion=="Compra Descuento"){
            DesCompra=t.haber;
        }
        if(t.descripcion=="Gasto de compra"){
            GastoCompra=t.debe;
        }
        if(t.descripcion=="Compra"){
            Compras=t.debe;
        }
        if(t.descripcion=="Compra Devolución"){
            DevCompra=t.haber;
        }
        if(t.descripcion=="Compra Rebaja"){
            RebCompra=t.haber;
        }
        
    });
    console.log(GastoCompra);
    TablaResultado();
}

function TablaResultado(){
    VentasNetas=Ventas-DevolVenta-RebVenta-DesVenta;

    document.getElementById("VentaTotal").innerText=Ventas;
    document.getElementById("DevVenta").innerText=DevolVenta;
    document.getElementById("RebVenta").innerText=RebVenta;
    document.getElementById("DesVenta").innerText=DesVenta;
    document.getElementById("VenNetas").innerText=VentasNetas;

    ComprasTotales=Compras+GastoCompra;

    document.getElementById("InvInicial").innerText=InventarioInicial;
    document.getElementById("Comp").innerText=Compras;
    document.getElementById("GastoCompra").innerText=GastoCompra;
    document.getElementById("CompraTotal").innerText=ComprasTotales;


    compraNeta=ComprasTotales-DevCompra-RebCompra-DesCompra;

    document.getElementById("DevCompra").innerText=DevCompra;
    document.getElementById("RebCompra").innerText=RebCompra;
    document.getElementById("DescCompra").innerText=DesCompra;
    document.getElementById("CompraNeta").innerText=compraNeta;

    MercanciaDisponible=compraNeta+InventarioInicial;

    document.getElementById("MercDisp").innerText=MercanciaDisponible;

    InventariFinal=compraNeta*0.03;

    document.getElementById("invFinal").innerText=InventariFinal;

    CostoVenta=MercanciaDisponible-InventariFinal;

    document.getElementById("CostoVentas").innerText=CostoVenta;

    utilidadB=VentasNetas-CostoVenta;

    document.getElementById("Utper").innerText=utilidadB;
    document.getElementById("admin").innerText=GastoAdmin;

    utilidadOp=utilidadB-GastoAdmin;

    document.getElementById("Util").innerText=utilidadOp;

    if(utilidadOp>0){
        text= "Se presenta una UTILIDAD debido a que las ventas son mayores que los gastos."
    }
    else{
        text= "Se presenta una PERDIDA   debido a que los gastos son mayores que las ventas."
    }

    document.getElementById("Conclusion").innerText=text;


}
