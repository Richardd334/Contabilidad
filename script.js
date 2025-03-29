// Variables globales
let transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];
let cuentas = JSON.parse(localStorage.getItem('cuentas')) || {};
let contadorFilas = 0;
let capitalSocial = 0;
let utilidad=0;
let ISR;

let PTU;




let concep={"saldo inical":0, "Capital social":0, "Reserva legal":0, "Emision de acciones":0, "prima de acciones":0,
    "utilidad":0, "Total aumentos":0 };
let dism={"decreto de dividendos":0,"Reserva legal":0, "Reembolso a socios":0, "Total disminuciones":0};
    
const tiposTransaccion = [
    "Gastos generales", 
    "Ventas",
    "Costo de le vendido"
];

//cargar la página
document.addEventListener('DOMContentLoaded', function() {

    const savedTransactions = JSON.parse(localStorage.getItem('transacciones')) || [];
    const savedCuentas = JSON.parse(localStorage.getItem('cuentas')) || {};
    //localStorage.clear();
    transacciones = savedTransactions;
    cuentas = savedCuentas;
    
    resetearBalance();

    calcularCapitalSocial();
    
    actualizarOpcionesSelect('descripcion0');
    actualizarBalanceCompleto();
    actualizarLibroDiarioCompleto();
    calcularBalanceGeneral();
    inicializarSelectCuentas();
    estado();
});

const cuentasIngresos = ['Ventas'];
const cuentasGastos = ['Gastos generales', 'Costo de le vendido'];

function estado(){
    concep["Total aumentos"]=0;
    dism["Total disminuciones"]=0;
    
    concep["Capital social"]= capitalSocial;
    dism["Reserva legal"]=(utilidad*0.05)/12;
    
    let x= Object.values(concep).reduce((sum, value) => sum + value, 0);
    concep["Total aumentos"]=x;

    x=Object.values(dism).reduce((sum, value) => sum + value, 0);
    dism["Total disminuciones"]=x;

    let tablaBalance = document.getElementById('Estado capital');
    tablaBalance.innerHTML = Object.entries(concep  )
        //.sort((a, b) => a[0].localeCompare(b[0]))
        .map(([cuenta, saldo]) => `
            <tr>
                <th>${cuenta}</th>
                <td class="">${Math.abs(saldo).toFixed(2)}</td>
            </tr>
        `).join('');

    tablaBalance = document.getElementById('Disminucion');

    tablaBalance.innerHTML = Object.entries(dism  )
    .map(([cuenta, saldo]) => `
        <tr>
            <th>${cuenta}</th>
            <td class="">${Math.abs(saldo).toFixed(2)}</td>
        </tr>
    `).join('');
    x=concep["Total aumentos"]-dism["Total disminuciones"];
    console.log(x)

    tot=document.getElementById('IncrementoNeto');

    tot.textContent = `Incremento Neto= $${Math.abs(x).toFixed(2)}`;

}

function resetearBalance() {
    for (const cuenta in cuentas) {
        cuentas[cuenta] = 0;
    }
}

function calcularCapitalSocial() {
    const aperturas = transacciones.filter(t => t.tipo === 'Apertura');
    capitalSocial = aperturas.reduce((sum, t) => sum + t.debe, 0);


    let aportaciones = transacciones
        .filter(t => t.tipo === "Venta" && t.descripcion ==="Ventas")
        .reduce((sum, t) => sum +  t.haber- t.debe, 0);

    let retiros = transacciones
        .filter(t => t.tipo === "Venta" && t.descripcion==="Costo de lo vendido")
        .reduce((sum, t) => sum +  t.debe - t.haber, 0);

    let gastos = transacciones
        .filter(t => t.descripcion ==="Gastos generales")
        //.reduce((sum, t) => sum +  t.haber- t.debe, 0);

  
    // console.log(transacciones);
    let utilidadBruta=aportaciones-retiros;
    utilidad=utilidadBruta-gastos[0].debe;

    PTU=utilidad* 0.1;
    ISR=utilidad*0.3

    //utilidad=utilidad-PTU-ISR;
    console.log(cuentas);
    console.log(utilidad);
    concep["Reserva legal"]=(utilidad*0.05)/12;
    concep["utilidad"]=utilidad;

}

function actualizarBalanceCompleto() {
    resetearBalance();
    
    transacciones.forEach(t => {
        cuentas[t.descripcion] = (cuentas[t.descripcion] || 0) + t.debe - t.haber;
    });
    
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    actualizarTablaBalance();
    generarBalanceComprobacion();
    inicializarSelectCuentas(); // Actualizar el select de cuentas
}


// Cargar datos guardados
function cargarDatosIniciales() {
    if (transacciones.length > 0) {
        actualizarBalance(transacciones);
        actualizarLibroDiarioCompleto();
        calcularBalanceGeneral();
    }
}

//Actualizar opciones en los selects
function actualizarOpcionesSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '';
    
    // Opción por defecto
    const opcionDefault = document.createElement('option');
    opcionDefault.value = '';
    opcionDefault.textContent = 'Seleccione una cuenta';
    opcionDefault.disabled = true;
    opcionDefault.selected = true;
    select.appendChild(opcionDefault);
    
    // Opciones de cuentas
    tiposTransaccion.concat(Object.keys(cuentas)).forEach(op => {
        const opcion = document.createElement('option');
        opcion.value = op;
        opcion.textContent = op;
        select.appendChild(opcion);
    });
}

// Agregar nueva cuenta
function AgregarCuenta() {
    const nombreCuenta = document.getElementById('nombreCuenta').value.trim();
    
    if (!nombreCuenta) {
        alert('Por favor ingrese un nombre para la cuenta');
        return;
    }
    
    if (tiposTransaccion.includes(nombreCuenta)) {
        alert('Esta cuenta ya existe en las opciones básicas');
        return;
    }
    
    if (cuentas[nombreCuenta]) {
        alert('Esta cuenta ya fue agregada anteriormente');
        return;
    }
    
    // Agregar la nueva cuenta
    cuentas[nombreCuenta] = 0;
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Actualizar todos los selects
    document.querySelectorAll('.select-descripcion').forEach(select => {
        actualizarOpcionesSelect(select.id);
    });
    
    document.getElementById('nombreCuenta').value = '';
    alert(`Cuenta "${nombreCuenta}" agregada correctamente`);
}

// Agregar nueva fila a la tabla
function agregarCelda() {
    contadorFilas++;
    const tablaIngresos = document.getElementById('ingresos');
    
    const fila = document.createElement('tr');
    fila.id = contadorFilas;
    fila.innerHTML = `
        <td>
            <select name="descripcion" id="descripcion${contadorFilas}" class="select-descripcion"></select>
        </td>
        <td><input type="number" name="debe" id="debe${contadorFilas}" step="0.01" min="0" class="input-debe"></td>
        <td><input type="number" name="haber" id="haber${contadorFilas}" step="0.01" min="0" class="input-haber"></td>
        <td><button class="btn-delete" onclick="eliminarCelda(${contadorFilas})">❌ Eliminar</button></td>
    `;
    
    tablaIngresos.appendChild(fila);
    actualizarOpcionesSelect(`descripcion${contadorFilas}`);
    
    // Agregar evento para evitar débito y crédito simultáneos
    const inputDebe = document.getElementById(`debe${contadorFilas}`);
    const inputHaber = document.getElementById(`haber${contadorFilas}`);
    
    inputDebe.addEventListener('input', function() {
        if (this.value > 0) inputHaber.value = '';
    });
    
    inputHaber.addEventListener('input', function() {
        if (this.value > 0) inputDebe.value = '';
    });
}

// Registrar transacción
function registrarTransaccion() {
    const tipoTransaccion = document.getElementById('Tipo').value;
    if (tipoTransaccion === 'Seleccionar') {
        alert('Seleccione un tipo de transacción válida');
        return;
    }

    const nuevasTransacciones = [];
    const filas = document.querySelectorAll('#ingresos tr');
    let errores = false;
    
    filas.forEach(fila => {
        const id = fila.id;
        const descripcion = document.getElementById(`descripcion${id}`).value.trim();
        const debe = parseFloat(document.getElementById(`debe${id}`).value) || 0;
        const haber = parseFloat(document.getElementById(`haber${id}`).value) || 0;
        
        // Validaciones
        if (!descripcion) {
            alert(`Falta seleccionar cuenta en la fila ${id}`);
            errores = true;
            return;
        }
        
        if (debe < 0 || haber < 0) {
            alert('Los valores no pueden ser negativos');
            errores = true;
            return;
        }
        
        if (debe > 0 && haber > 0) {
            alert('No puede haber débito y crédito en la misma línea');
            errores = true;
            return;
        }
        
        if (debe === 0 && haber === 0) {
            alert(`La fila ${id} no tiene montos registrados`);
            errores = true;
            return;
        }
        
        nuevasTransacciones.push({
            tipo: tipoTransaccion,
            descripcion,
            debe,
            haber,
            fecha: new Date().toISOString().split('T')[0] // Fecha actual
        });
    });
    
    if (errores) return;
    
    if (nuevasTransacciones.length === 0) {
        alert('Debe ingresar al menos una línea válida');
        return;
    }
    
    if (!validarBalance(nuevasTransacciones)) {
        alert('La transacción no está balanceada (suma de débitos ≠ suma de créditos)');
        return;
    }
    
    const fechaActual = new Date().toISOString().split('T')[0];
    nuevasTransacciones.forEach(t => {
        t.fecha = fechaActual;
    });
    

    // Guardar transacción
    transacciones = [...transacciones, ...nuevasTransacciones];
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
  
    actualizarBalance(nuevasTransacciones);
    actualizarTransaccionLibroDiario(nuevasTransacciones, tipoTransaccion);
    calcularBalanceGeneral();
    resetearTablaIngresar();
    actualizarBalanceCompleto();
    
    alert('Transacción registrada correctamente');
}

// Validar balance de la transacción
function validarBalance(transacciones) {
    const totalDebe = transacciones.reduce((sum, t) => sum + t.debe, 0);
    const totalHaber = transacciones.reduce((sum, t) => sum + t.haber, 0);
    return Math.abs(totalDebe - totalHaber) < 0.01; // Tolerancia para decimales
}

// Eliminar fila
function eliminarCelda(id) {
    if (id === '0') {
        document.getElementById('debe0').value = '';
        document.getElementById('haber0').value = '';
        document.getElementById('descripcion0').value = '';
    } else {
        document.getElementById(id)?.remove();
    }
}

// Resetear tabla de ingreso
function resetearTablaIngresar() {
    document.getElementById('ingresos').innerHTML = `
        <tr id="0">
            <td><select name="descripcion" id="descripcion0" class="select-descripcion"></select></td>
            <td><input type="number" name="debe" id="debe0" step="0.01" min="0" class="input-debe"></td>
            <td><input type="number" name="haber" id="haber0" step="0.01" min="0" class="input-haber"></td>
            <td><button class="btn-delete" onclick="eliminarCelda(0)">❌ Eliminar</button></td>
        </tr>
    `;
    actualizarOpcionesSelect('descripcion0');
    document.getElementById('Tipo').value = 'Seleccionar';
    contadorFilas = 0;
}

// Actualizar balance general
function actualizarBalance(nuevasTransacciones) {
    nuevasTransacciones.forEach(t => {
        cuentas[t.descripcion] = (cuentas[t.descripcion] || 0) + t.debe - t.haber;
    });
    
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Actualizamos toda la tabla (no solo las nuevas)
    actualizarTablaBalance();
}

function actualizarTablaBalance() {
    const tablaBalance = document.getElementById('TablaTrans');
    tablaBalance.innerHTML = Object.entries(cuentas)
        //.sort((a, b) => a[0].localeCompare(b[0]))
        .map(([cuenta, saldo]) => `
            <tr>
                <td>${cuenta}</td>
                <td class="${saldo > 0 ? 'positivo' : ''}">${saldo > 0 ? saldo.toFixed(2) : '-'}</td>
                <td class="${saldo < 0 ? 'negativo' : ''}">${saldo < 0 ? Math.abs(saldo).toFixed(2) : '-'}</td>
            </tr>
        `).join('');

}

// Actualizar libro diario
function actualizarTransaccionLibroDiario(transacciones, tipo) {
    const libroDiario = document.getElementById('Tabla_diario');
    const numeroTransaccion = libroDiario.querySelectorAll('table').length + 1;
    
    const tablaHTML = `
        <div class="transaccion">
            <h3>Transacción #${numeroTransaccion} - ${tipo} (${transacciones[0].fecha})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Cuenta</th>
                        <th>Débito</th>
                        <th>Crédito</th>
                    </tr>
                </thead>
                <tbody>
                    ${transacciones.map(t => `
                        <tr>
                            <td>${t.descripcion}</td>
                            <td>${t.debe > 0 ? t.debe.toFixed(2) : '-'}</td>
                            <td>${t.haber > 0 ? t.haber.toFixed(2) : '-'}</td>
                        </tr>
                    `).join('')}
                    <tr class="total">
                        <td><strong>Total</strong></td>
                        <td><strong>${transacciones.reduce((sum, t) => sum + t.debe, 0).toFixed(2)}</strong></td>
                        <td><strong>${transacciones.reduce((sum, t) => sum + t.haber, 0).toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    libroDiario.insertAdjacentHTML('afterbegin', tablaHTML);
}

// Cargar todo el libro diario
function actualizarLibroDiarioCompleto() {
    const transaccionesAgrupadas = agruparTransacciones();
    const libroDiario = document.getElementById('Tabla_diario');
    libroDiario.innerHTML = '<h2>Libro Diario</h2>';
    
    transaccionesAgrupadas.forEach((grupo, index) => {
        libroDiario.insertAdjacentHTML('beforeend', `
            <div class="transaccion">
                <h3>Transacción #${index + 1} - ${grupo.tipo} (${grupo.fecha})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Cuenta</th>
                            <th>Débito</th>
                            <th>Crédito</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grupo.transacciones.map(t => `
                            <tr>
                                <td>${t.descripcion}</td>
                                <td>${t.debe > 0 ? t.debe.toFixed(2) : '-'}</td>
                                <td>${t.haber > 0 ? t.haber.toFixed(2) : '-'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td><strong>Total</strong></td>
                            <td><strong>${grupo.transacciones.reduce((sum, t) => sum + t.debe, 0).toFixed(2)}</strong></td>
                            <td><strong>${grupo.transacciones.reduce((sum, t) => sum + t.haber, 0).toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `);
    });
}

// Agrupar transacciones por fecha y tipo
function agruparTransacciones() {
    const grupos = {};
    
    transacciones.forEach(t => {
        const key = `${t.fecha}-${t.tipo}`;
        if (!grupos[key]) {
            grupos[key] = {
                tipo: t.tipo,
                fecha: t.fecha,
                transacciones: []
            };
        }
        grupos[key].transacciones.push(t);
    });
    
    return Object.values(grupos);
}

// Calcular balance general
function calcularBalanceGeneral() {
    const totalActivo = Object.entries(cuentas).reduce((sum, [cuenta, saldo]) => {
        return sum + (saldo > 0 ? saldo : 0);
    }, 0);
    
    const totalPasivo = Object.entries(cuentas).reduce((sum, [cuenta, saldo]) => {
        return sum + (saldo < 0 ? Math.abs(saldo) : 0);
    }, 0);
    
    // Si es apertura, actualizar capital
    const ultimaTransaccion = transacciones[transacciones.length - 1];
    if (ultimaTransaccion?.tipo === 'Apertura') {
        capitalSocial = totalActivo;
    }
    
    // Actualizar UI
    document.getElementById('Activo').innerHTML = `<strong>Total Activos:</strong> $${totalActivo.toFixed(2)}`;
    document.getElementById('Pasivo').innerHTML = `<strong>Total Pasivos:</strong> $${totalPasivo.toFixed(2)}`;
    document.getElementById('Capital').innerHTML = `<strong>Capital Social:</strong> $${capitalSocial.toFixed(2)}`;
    // document.getElementById('TotalActivo').textContent = `$${totalActivo.toFixed(2)}`;
    // document.getElementById('TotalPasivo').textContent = `$${(totalPasivo + capitalSocial).toFixed(2)}`;
}

// Borrar todos los datos
function borrarTodo() {
    if (confirm('¿Está seguro que desea borrar TODOS los datos?\nEsta acción no se puede deshacer.')) {
        transacciones = [];
        cuentas = {};
        capitalSocial = 0;
        contadorFilas = 0;
        
        localStorage.removeItem('transacciones');
        localStorage.removeItem('cuentas');
        
        resetearTablaIngresar();
        document.getElementById('TablaTrans').innerHTML = '';
        document.getElementById('Tabla_diario').innerHTML = '<h2>Libro Diario</h2>';
        calcularBalanceGeneral();
        
        alert('Todos los datos han sido eliminados');
    }
}
function generarBalanceComprobacion() {
    const cuerpo = document.getElementById('cuerpoBalanceComprobacion');
    const totalDebeElement = document.getElementById('totalDebe');
    const totalHaberElement = document.getElementById('totalHaber');
    const resultadoElement = document.getElementById('resultadoBalance');
    const totalCapContable=document.getElementById('CapContable');
    
    
    let totalDebe = 0;
    let totalHaber = 0;
    
    // Limpiar tabla
    cuerpo.innerHTML = '';
    
    // Ordenar cuentas alfabéticamente
    const cuentasOrdenadas = Object.keys(cuentas).sort();
    
    // Generar filas para cada cuenta
    cuentasOrdenadas.forEach(cuenta => {
        const saldo = cuentas[cuenta];
        const fila = document.createElement('tr');
        
        if (saldo > 0) {
            // Saldo deudor
            fila.innerHTML = `
                <td>${cuenta}</td>
                <td>${saldo.toFixed(2)}</td>
                <td>-</td>
            `;
            totalDebe += saldo;
        } else if (saldo < 0) {
            // Saldo acreedor
            fila.innerHTML = `
                <td>${cuenta}</td>
                <td>-</td>
                <td>${Math.abs(saldo).toFixed(2)}</td>
            `;
            totalHaber += Math.abs(saldo);
        } else {
            // Saldo cero (no se muestra)
            return;
        }
        
        cuerpo.appendChild(fila);
    });
    
    // Actualizar totales
    totalDebeElement.textContent = `$${totalDebe.toFixed(2)}`;
    totalHaberElement.textContent = `$${totalHaber.toFixed(2)}`;
    console.log(capitalSocial);
    
    totalCapContable.textContent = `Capital contable (capital social + utilidad)= $${utilidad+capitalSocial}`;
  
    
    // Verificar balance
    const diferencia = Math.abs(totalDebe - totalHaber);
    const esBalanceado = diferencia < 0.01; // Tolerancia para decimales
    
    if (esBalanceado) {
        resultadoElement.textContent = '✓ Balance correcto (Débitos = Créditos)';
        resultadoElement.className = 'balance-correcto';
    } else {
        resultadoElement.textContent = `✗ Balance incorrecto (Diferencia: $${diferencia.toFixed(2)})`;
        resultadoElement.className = 'balance-incorrecto';
    }
}


// Función para inicializar el select de cuentas
function inicializarSelectCuentas() {
    const select = document.getElementById('selectCuenta');
    select.innerHTML = '<option value="">-- Todas las cuentas --</option>';
    
    // Ordenar cuentas alfabéticamente
    const cuentasOrdenadas = Object.keys(cuentas).sort();
    
    cuentasOrdenadas.forEach(cuenta => {
        const option = document.createElement('option');
        option.value = cuenta;
        option.textContent = cuenta;
        select.appendChild(option);
    });
}

// Función para generar el libro mayor completo
function generarLibroMayorCompleto() {
    const contenedor = document.getElementById('contenedor-mayor');
    contenedor.innerHTML = '';
    
    // Ordenar cuentas alfabéticamente
    const cuentasOrdenadas = Object.keys(cuentas).sort();
    
    cuentasOrdenadas.forEach(cuenta => {
        generarLibroMayorCuenta(cuenta);
    });
}

// Función para generar el libro mayor de una cuenta específica
function generarLibroMayorCuenta(nombreCuenta) {
    const contenedor = document.getElementById('contenedor-mayor');
    
    // Filtrar transacciones para esta cuenta
    const transaccionesCuenta = transacciones.filter(t => t.descripcion === nombreCuenta);
    
    if (transaccionesCuenta.length === 0) return;
    
    // Crear contenedor para esta cuenta
    const divCuenta = document.createElement('div');
    divCuenta.className = 'cuenta-mayor';
    divCuenta.id = `mayor-${nombreCuenta.replace(/\s+/g, '-')}`;
    
    // Calcular saldo
    let saldo = 0;
    let html = `
        <h3>${nombreCuenta}</h3>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Transacción</th>
                    <th>Debe</th>
                    <th>Haber</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Procesar cada transacción
    transaccionesCuenta.forEach(t => {
        const debe = t.debe || 0;
        const haber = t.haber || 0;
        saldo += debe - haber;
        
        html += `
            <tr>
                <td>${t.fecha}</td>
                <td>${t.tipo}</td>
                <td>${debe > 0 ? debe.toFixed(2) : '-'}</td>
                <td>${haber > 0 ? haber.toFixed(2) : '-'}</td>
                <td>${saldo.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div class="saldo-mayor ${saldo >= 0 ? 'saldo-deudor' : 'saldo-acreedor'}">
            Saldo final: $${Math.abs(saldo).toFixed(2)} ${saldo >= 0 ? 'Deudor' : 'Acreedor'}
        </div>
    `;
    
    divCuenta.innerHTML = html;
    contenedor.appendChild(divCuenta);
}

// Función para cargar el libro mayor según selección
function cargarLibroMayor() {
    const select = document.getElementById('selectCuenta');
    const cuentaSeleccionada = select.value;
    const contenedor = document.getElementById('contenedor-mayor');
    
    contenedor.innerHTML = '';
    
    if (cuentaSeleccionada === '') {
        generarLibroMayorCompleto();
    } else {
        generarLibroMayorCuenta(cuentaSeleccionada);
    }
}