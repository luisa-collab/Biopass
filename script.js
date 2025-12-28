document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de Biometria Iniciado.");

    // ==========================================
    // LADO ESQUERDO: LABORATÓRIO
    // ==========================================
    const bioInput = document.getElementById('bio-input');
    const canvasChart = document.getElementById('bioChart');

    if (bioInput && canvasChart) {
        const btnRegister = document.getElementById('btn-register');
        const btnVerify = document.getElementById('btn-verify');
        const btnReset = document.getElementById('btn-reset');
        const statusMsg = document.getElementById('status-msg');
        
        // Slider Global
        const riskSlider = document.getElementById('risk-slider');
        const riskVal = document.getElementById('risk-val');
        if(riskSlider && riskVal) {
            riskSlider.addEventListener('input', () => { riskVal.innerText = riskSlider.value; });
        }
        
        const ctx = canvasChart.getContext('2d');
        let keystrokes = []; 
        let profileA = []; 
        let profileB = []; 
        let myChart = null; 

        bioInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') { keystrokes = []; return; }
            if (e.key.length > 1) return;
            keystrokes.push(Date.now());
        });

        function processTypingData(times) {
            let intervals = [];
            for (let i = 0; i < times.length - 1; i++) {
                intervals.push(times[i+1] - times[i]);
            }
            return intervals;
        }

        if(btnRegister) {
            btnRegister.addEventListener('click', () => {
                if (keystrokes.length < 2) {
                    statusMsg.innerText = "Digite a palavra completa!";
                    statusMsg.style.color = "#ff3b30";
                    return;
                }
                profileA = processTypingData(keystrokes);
                statusMsg.innerText = "Padrão Gravado com Sucesso!";
                statusMsg.style.color = "#34c759";
                
                bioInput.value = '';
                keystrokes = [];
                btnRegister.style.display = 'none';
                btnVerify.disabled = false;
                bioInput.focus();
            });
        }

        if(btnVerify) {
            btnVerify.addEventListener('click', () => {
                if (keystrokes.length < 2) {
                    statusMsg.innerText = "Digite para verificar!";
                    return;
                }
                profileB = processTypingData(keystrokes);
                updateChart(profileA, profileB); 
                
                let diff = 0;
                const length = Math.min(profileA.length, profileB.length);
                for(let i = 0; i < length; i++) {
                    diff += Math.abs(profileA[i] - profileB[i]);
                }
                const avgDiff = diff / length;
                const limiteDinamico = riskSlider ? parseInt(riskSlider.value) : 35;

                if (avgDiff < limiteDinamico) { 
                    statusMsg.innerHTML = `Identidade Confirmada <i class="fa-solid fa-check-circle"></i>`;
                    statusMsg.style.color = "#34c759";
                } else {
                    statusMsg.innerHTML = `Acesso Negado <i class="fa-solid fa-lock"></i>`;
                    statusMsg.style.color = "#ff3b30";
                }
            });
        }

        if(btnReset) {
            btnReset.addEventListener('click', () => {
                profileA = []; profileB = []; keystrokes = [];
                bioInput.value = '';
                statusMsg.innerText = "Aguardando digitação...";
                statusMsg.style.color = "#86868b";
                btnRegister.style.display = 'block';
                btnVerify.disabled = true;
                if(myChart) myChart.destroy();
                const dnaContainer = document.getElementById('dna-breakdown');
                if(dnaContainer) dnaContainer.style.display = 'none';
                bioInput.focus();
            });
        }

        function updateChart(data1, data2) {
            if (myChart) myChart.destroy();
            const labels = data1.map((_, i) => `T${i+1}`);
            
            if (typeof Chart !== 'undefined') {
                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: 'Original', data: data1, borderColor: '#34c759', borderWidth: 3, tension: 0.4, pointRadius: 0 },
                            { label: 'Tentativa', data: data2, borderColor: '#ff3b30', borderWidth: 3, borderDash: [5, 5], tension: 0.4, pointRadius: 0 }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }, // Clean
                        scales: { y: { display: false }, x: { display: false } } 
                    }
                });
            }
            renderDNA(data1, data2);
        }

        function renderDNA(original, tentativa) {
            const dnaContainer = document.getElementById('dna-breakdown');
            const dnaBars = document.getElementById('dna-bars');
            if(!dnaContainer || !dnaBars) return;

            dnaContainer.style.display = 'block';
            dnaBars.innerHTML = ''; 

            const maxVal = Math.max(...original, ...tentativa);

            for(let i = 0; i < Math.min(original.length, tentativa.length); i++) {
                const widthOrig = (original[i] / maxVal) * 100;
                const widthTent = (tentativa[i] / maxVal) * 100;

                const row = document.createElement('div');
                row.className = 'dna-row';
                row.innerHTML = `
                    <div class="dna-label">${i+1}</div>
                    <div class="dna-bars-area">
                        <div class="bar-wrapper"><div class="bar bar-original" style="width: ${widthOrig}%"></div></div>
                        <div class="bar-wrapper"><div class="bar bar-test" style="width: ${widthTent}%"></div></div>
                    </div>
                `;
                dnaBars.appendChild(row);
            }
        }
    } 

    // ==========================================
    // LADO DIREITO: IPHONE (SIMULADOR)
    // ==========================================
    const bankSection = document.querySelector('.phone-container');
    
    if (bankSection) {
        const btnStartDemo = document.getElementById('btn-start-demo');
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');
        const inputSetup = document.getElementById('bank-input-setup');
        const inputLogin = document.getElementById('bank-input-login');
        const btnSetup = document.getElementById('btn-bank-setup');
        const btnLogin = document.getElementById('btn-bank-login');
        const resultBox = document.getElementById('bank-result');

        let bankKeystrokes = [];
        let masterProfile = [];

        if(btnStartDemo) btnStartDemo.addEventListener('click', () => resetBankDemo());

        // Captura
        const capture = (e) => {
            if(e.key === 'Backspace') bankKeystrokes = [];
            else if(e.key.length === 1) bankKeystrokes.push(Date.now());
        };
        if(inputSetup) inputSetup.addEventListener('keydown', capture);
        if(inputLogin) inputLogin.addEventListener('keydown', capture);

        // Setup
        if(btnSetup) {
            btnSetup.addEventListener('click', () => {
                if(bankKeystrokes.length < 3) { alert("Senha muito curta!"); return; }
                masterProfile = [];
                for (let i = 0; i < bankKeystrokes.length - 1; i++) {
                    masterProfile.push(bankKeystrokes[i+1] - bankKeystrokes[i]);
                }
                step1.style.display = 'none';
                step2.style.display = 'block';
                bankKeystrokes = [];
                inputLogin.focus();
            });
        }

        // Login
        if(btnLogin) {
            btnLogin.addEventListener('click', () => {
                if(bankKeystrokes.length < 3) { alert("Digite a senha!"); return; }
                let attemptProfile = [];
                for (let i = 0; i < bankKeystrokes.length - 1; i++) {
                    attemptProfile.push(bankKeystrokes[i+1] - bankKeystrokes[i]);
                }
                
                let diff = 0;
                const length = Math.min(masterProfile.length, attemptProfile.length);
                for(let i = 0; i < length; i++) {
                    diff += Math.abs(masterProfile[i] - attemptProfile[i]);
                }
                const avgDiff = diff / length;

                // Resultado
                resultBox.style.display = 'flex';
                const limit = document.getElementById('risk-slider') ? parseInt(document.getElementById('risk-slider').value) : 35;

                if(avgDiff < limit) {
                    resultBox.innerHTML = `
                        <div style="font-size:3rem; color:#34c759; margin-bottom:15px;"><i class="fa-solid fa-face-smile"></i></div>
                        <h3 style="color:#1d1d1f; margin-bottom:5px;">Acesso Permitido</h3>
                        <p style="color:#86868b; font-size:0.9rem;">Biometria Confirmada.</p>
                        <small style="color:#34c759; font-weight:bold; background:#e8fce8; padding:5px 10px; border-radius:8px;">Divergência: ${Math.round(avgDiff)}ms</small>
                        <button onclick="document.getElementById('bank-result').style.display='none'" style="margin-top:25px; background:none; border:none; color:#007aff; cursor:pointer; font-weight:600;">Tentar novamente</button>
                    `;
                } else {
                    resultBox.innerHTML = `
                        <div style="font-size:3rem; color:#ff3b30; margin-bottom:15px;"><i class="fa-solid fa-face-frown"></i></div>
                        <h3 style="color:#1d1d1f; margin-bottom:5px;">Bloqueado</h3>
                        <p style="color:#86868b; font-size:0.9rem;">Padrão não reconhecido.</p>
                        <small style="color:#ff3b30; font-weight:bold; background:#fee2e2; padding:5px 10px; border-radius:8px;">Divergência: ${Math.round(avgDiff)}ms</small>
                        <button onclick="document.getElementById('bank-result').style.display='none'" style="margin-top:25px; background:none; border:none; color:#007aff; cursor:pointer; font-weight:600;">Tentar novamente</button>
                    `;
                }
            });
        }

        function resetBankDemo() {
            step1.style.display = 'block';
            step2.style.display = 'none';
            resultBox.style.display = 'none';
            inputSetup.value = '';
            inputLogin.value = '';
            bankKeystrokes = [];
            masterProfile = [];
        }
    }
});