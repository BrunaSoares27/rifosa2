import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Modal,
  Platform 
} from 'react-native';
import {useState, useRef} from 'react';
import * as Clipboard from 'expo-clipboard';
import GradeNumeros from './GradeNumeros';
import ModalSorteio from './ModalSorteio';
import ModalComprador from './ModalComprador';
import CartelaPrint from './CartelaPrint';

// Importa a biblioteca apenas se NÃO estiver rodando no navegador/web
const MediaLibrary = Platform.OS !== 'web' ? require('expo-media-library') : null;

// Função helper para calcular quanto tempo falta para o sorteio
  const calcularTempoRestante = (dataStr, estaEncerrada) => {
    if (estaEncerrada) return "Sorteio finalizado";
    if (!dataStr || dataStr === "A definir") return "Data a definir pelo organizador";

    // Espera formato DD/MM/AAAA
    const partes = dataStr.split('/');
    if (partes.length !== 3) return "Data a definir pelo organizador";

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Mês no JS começa em 0
    const ano = parseInt(partes[2], 10);

    const dataAlvo = new Date(ano, mes, dia);
    const hoje = new Date();

    // Zera as horas para comparar apenas os dias
    hoje.setHours(0, 0, 0, 0);
    dataAlvo.setHours(0, 0, 0, 0);

    const diferencaMs = dataAlvo - hoje;
    const diferencaDias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

    if (diferencaDias < 0) {
      return "Data do sorteio já passou";
    } else if (diferencaDias === 0) {
      return "É hoje!";
    } else if (diferencaDias >= 30) {
      const meses = Math.floor(diferencaDias / 30);
      return `Faltam ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      return `Faltam ${diferencaDias} ${diferencaDias === 1 ? 'dia' : 'dias'}`;
    }
  };

export default function TelaGerenciar({ onVoltar, rifaAtiva, setRifaAtiva, rifas, setRifas }) {
  const viewShotRef = useRef(); // <--- Referência para tirar o print
  // Pegamos os dados reais da rifa ativa
  const dataSorteio = rifaAtiva?.dataSorteio || "A definir";
  const numInicial = rifaAtiva?.numeroInicial || 1;
  const numFinal = rifaAtiva?.numeroFinal || 60;
  const tituloPremio = rifaAtiva?.tituloPremio;

  // Gera a lista de números do intervalo real da rifa
  const numerosTotaisRifa = Array.from(
    { length: numFinal - numInicial + 1 }, 
    (_, i) => numInicial + i
  );
  
  const numerosVendidos = rifaAtiva?.numerosOcupados || [];

  // Função para capturar e salvar na galeria
  /*
  const handleBaixarCartela = async () => {
    try {
      // 1. Pede permissão de gravação/leitura na galeria
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        alert('É necessário dar permissão para salvar fotos na sua galeria!');
        return;
      }

      // 2. Pequena pausa para garantir que o layout oculto foi montado no React
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. Captura a imagem em URI
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        alert('Erro ao carregar o gerador de imagem.');
        return;
      }

      const uri = await viewShotRef.current.capture();

      // 4. Cria o arquivo na galeria de mídia do celular
      await MediaLibrary.createAssetAsync(uri);
      alert('Cartela salva na sua galeria de fotos com sucesso!');
    } catch (error) {
      console.log('Erro detalhado:', error);
      alert('Não foi possível salvar a cartela no momento.');
    }
  };
  */

  // Função para capturar e baixar/salvar a cartela
  const handleBaixarCartela = async () => {
    try {
      // 1. Pequena pausa para garantir que o layout oculto foi renderizado
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!viewShotRef.current || !viewShotRef.current.capture) {
        alert('Erro ao carregar o gerador de imagem.');
        return;
      }

      // 2. Captura a imagem em URI (base64/data-url na web)
      const uri = await viewShotRef.current.capture();

      // 3. SE FOR NAVEGADOR (WEB)
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `cartela-${rifaAtiva?.codigoRifa || 'rifa'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 4. SE FOR DISPOSITIVO MÓVEL (ANDROID/IOS)
      if (MediaLibrary) {
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== 'granted') {
          alert('É necessário dar permissão para salvar fotos na sua galeria!');
          return;
        }

        await MediaLibrary.createAssetAsync(uri);
        alert('Cartela salva na sua galeria de fotos com sucesso!');
      }
    } catch (error) {
      console.log('Erro detalhado:', error);
      alert('Não foi possível salvar a cartela no momento.');
    }
  };

  // --- ESTADOS DOS MODAIS E DA VENDA ---
  const [modalQtdVisivel, setModalQtdVisivel] = useState(false);
  const [modalCodigoVisivel, setModalCodigoVisivel] = useState(false);
  const [qtdNumerosVenda, setQtdNumerosVenda] = useState('');
  const [codigoVendaGerado, setCodigoVendaGerado] = useState('VEN9876');

  // ESTADOS DO COMPRADOR E DO SORTEIO
  const [modalCompradorVisivel, setModalCompradorVisivel] = useState(false);
  const [compradorSelecionado, setCompradorSelecionado] = useState(null);
  const [numeroClicado, setNumeroClicado] = useState(null);

  const [modalConfirmarSorteioVisivel, setModalConfirmarSorteioVisivel] = useState(false);
  const [carregandoSorteio, setCarregandoSorteio] = useState(false);
  const [modalResultadoVisivel, setModalResultadoVisivel] = useState(false);
  const [dadosVencedor, setDadosVencedor] = useState(null);

  // Ação para gerar código VEN...
  const handleGerarCodigoVenda = () => {
    const qtdStr = qtdNumerosVenda.trim();

    // 1. Impede vírgula, ponto ou caracteres não numéricos
    if (!/^\d+$/.test(qtdStr)) {
      alert('Informe uma quantdade válida!');
      return;
    }

    const qtd = parseInt(qtdStr, 10);

    if (isNaN(qtd) || qtd <= 0) {
      alert('Informe uma quantidade válida de números!');
      return;
    }

    // 2. Opcional/Recomendado: Valida se a quantidade pedida cabe no saldo de números livres
    const totalNumeros = numerosTotaisRifa.length;
    const disponiveis = totalNumeros - numerosVendidos.length;

    if (qtd > disponiveis) {
      alert(`Quantidade indisponível! Restam apenas ${disponiveis} números livres nesta rifa.`);
      return;
    }

    // 3. Gera o código e atualiza a lista
    const numAleatorio = Math.floor(1000 + Math.random() * 9000);
    const novoCodigo = `VEN${numAleatorio}`;

    const novoLoteVenda = {
      codigoVenda: novoCodigo,
      qtdNumeros: qtd,
      usado: false
    };

    if (setRifas && rifas) {
      const rifasAtualizadas = rifas.map(r => {
        if (r.codigoRifa === rifaAtiva.codigoRifa) {
          return {
            ...r,
            codigosVenda: [...r.codigosVenda, novoLoteVenda]
          };
        }
        return r;
      });

      setRifas(rifasAtualizadas);
    }

    setCodigoVendaGerado(novoCodigo);
    setModalQtdVisivel(false);
    setModalCodigoVisivel(true);
  };

  const copiarCodigoVenda = async () => {
    await Clipboard.setStringAsync(codigoVendaGerado);
    alert('Código de venda copiado para a área de transferência!');
  };

  const handleCliqueNumero = (num) => {
    if (numerosVendidos.includes(num)) {
      const historicoCompras = rifaAtiva?.compras || [];
      const donoDoNumero = historicoCompras.find(c => c.numeros && c.numeros.includes(num));
      setNumeroClicado(num);
      setCompradorSelecionado(donoDoNumero || { nome: 'Não identificado', telefone: 'Sem telefone' });
      setModalCompradorVisivel(true);
    }
  };

  const handleExecutarSorteio = () => {
    // 1. Verifica se há números comprados para sortear
    if (numerosVendidos.length === 0) {
      alert('Não há números vendidos nesta rifa para sortear!');
      setModalConfirmarSorteioVisivel(false);
      return;
    }

    setModalConfirmarSorteioVisivel(false);

    // 2. Sorteia um número aleatório instantaneamente entre os vendidos
    const numSorteado = numerosVendidos[Math.floor(Math.random() * numerosVendidos.length)];

    // 3. Busca o nome do comprador correspondente nas compras
    const historicoCompras = rifaAtiva?.compras || [];
    const compradorVencedor = historicoCompras.find(c => c.numeros && c.numeros.includes(numSorteado));
    const nomeGanhador = compradorVencedor ? compradorVencedor.nome : 'Comprador não identificado';

    const resultado = {
      numero: numSorteado,
      nome: nomeGanhador
    };

    // 4. Atualiza o estado da rifa para encerrada
    const rifaEncerradaObjeto = {
      ...rifaAtiva,
      encerrada: true,
      vencedor: resultado
    };

    if (setRifaAtiva) {
      setRifaAtiva(rifaEncerradaObjeto);
    }

    if (setRifas && rifas) {
      const rifasAtualizadas = rifas.map(r => {
        if (r.codigoRifa === rifaAtiva.codigoRifa) {
          return rifaEncerradaObjeto;
        }
        return r;
      });

      setRifas(rifasAtualizadas);
    }

    // 5. Exibe o resultado direto na tela!
    setDadosVencedor(resultado);
    setModalResultadoVisivel(true);
  };
  
  const tempoRestante = calcularTempoRestante(dataSorteio, rifaAtiva?.encerrada);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#706054' }}>
      <View style={styles.container}>
        
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity style={styles.btnTopLeft} onPress={onVoltar}>
          <Image 
            source={require('./Images/voltar.png')} 
            style={styles.iconTop} 
          />
        </TouchableOpacity>

        {/* LOGO */}
        <Image style={styles.logo} source={require('./Images/logoRifosa.png')}/>

        {/* INFORMAÇÕES DA RIFA */}
       <View style={styles.headerInfo}>
          <Text style={styles.restanteFrase}>{tituloPremio}</Text>
          <Text style={styles.labelData}>Data do Sorteio: <Text style={styles.valData}>{dataSorteio}</Text></Text>
          <Text style={styles.labelTempo}>Tempo restante: <Text style={styles.valTempo}>{tempoRestante}</Text></Text>
          
          <TouchableOpacity 
            style={[styles.btnVender, rifaAtiva?.encerrada && { backgroundColor: '#888' }]}
            disabled={rifaAtiva?.encerrada}
            onPress={() => setModalQtdVisivel(true)}
          >
            <Text style={styles.btnVenderText}>
              {rifaAtiva?.encerrada ? "RIFA ENCERRADA" : "VENDER"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GRADE DE NÚMEROS */}
        <View style={styles.gridWrapper}>
          <GradeNumeros 
            numerosTotais={numerosTotaisRifa}
            numerosOcupados={numerosVendidos}
            numeroVencedor={rifaAtiva?.vencedor?.numero}
            interativo={false}
            onToggleNumero={handleCliqueNumero}
          />
        </View>

        {/* ÁREA DOS BOTÕES (SORTEAR + DOWNLOAD) */}
        <View style={styles.botoesAcaoRow}>
          
          {/* BOTÃO SORTEAR */}
          <TouchableOpacity 
            style={[styles.btnSortear, rifaAtiva?.encerrada && { backgroundColor: '#888' }]}
            disabled={rifaAtiva?.encerrada}
            onPress={() => setModalConfirmarSorteioVisivel(true)}
          >
            <Text style={styles.btnSortearText}>
              {rifaAtiva?.encerrada ? "SORTEIO REALIZADO" : "SORTEAR"}
            </Text>
          </TouchableOpacity>

          {/* BOTÃO DOWNLOAD DA CARTELA */}
          <TouchableOpacity 
            style={styles.btnDownload}
            onPress={handleBaixarCartela}
            activeOpacity={0.7}
          >
            <Text style={styles.btnDownloadText}>Download</Text>
          </TouchableOpacity>

        </View>

        {/* COMPONENTE OCULTO QUE SERÁ CAPTURADO */}
        <CartelaPrint ref={viewShotRef} rifaAtiva={rifaAtiva} />

        {/* --- POPUP 1: INSERIR QUANTIDADE DE NÚMEROS --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalQtdVisivel}
          onRequestClose={() => setModalQtdVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity 
                style={styles.btnCloseX} 
                onPress={() => setModalQtdVisivel(false)}
              >
                <Text style={styles.txtX}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitulo}>Quantos números quer liberar?</Text>

              <TextInput
                style={styles.inputModal}
                placeholder="Ex: 3"
                placeholderTextColor="#AAA"
                keyboardType="numeric"
                value={qtdNumerosVenda}
                onChangeText={setQtdNumerosVenda}
              />

              <TouchableOpacity 
                style={styles.btnOkModal}
                onPress={handleGerarCodigoVenda}
              >
                <Text style={styles.btnOkModalText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --- POPUP 2: EXIBIR CÓDIGO DE VENDA GERADO --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalCodigoVisivel}
          onRequestClose={() => setModalCodigoVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTextInfo}>
                Código gerado com sucesso! Aqui está o código de venda:
              </Text>

              <TouchableOpacity 
                style={styles.codigoCard} 
                onPress={copiarCodigoVenda}
                activeOpacity={0.7}
              >
                <Text style={styles.codigoText}>{codigoVendaGerado}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnOkModal}
                onPress={() => {
                  setModalCodigoVisivel(false);
                  setQtdNumerosVenda('');
                  if (onVoltar) onVoltar();
                }}
              >
                <Text style={styles.btnOkModalText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL COMPRADOR */}
        <ModalComprador 
          visible={modalCompradorVisivel}
          onClose={() => setModalCompradorVisivel(false)}
          numeroClicado={numeroClicado}
          comprador={compradorSelecionado}
        />

        {/* MODAL DE SORTEIO E ANIMAÇÃO */}
        <ModalSorteio 
          modalConfirmarVisivel={modalConfirmarSorteioVisivel}
          setModalConfirmarVisivel={setModalConfirmarSorteioVisivel}
          carregandoSorteio={carregandoSorteio}
          modalResultadoVisivel={modalResultadoVisivel}
          setModalResultadoVisivel={setModalResultadoVisivel}
          dadosVencedor={dadosVencedor}
          onConfirmarSorteio={handleExecutarSorteio}
        />

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#706054',
  },
  btnTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 35,
    height: 35,
    zIndex: 10,
  },
  iconTop: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginTop: 15,
    resizeMode: 'contain',
  },
  headerInfo: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  },
  labelData: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valData: {
    color: '#FF9754',
  },
  labelTempo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  valTempo: {
    color: '#FF9754',
  },
  btnVender: {
    backgroundColor: '#C44E04',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
  },
  btnVenderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#706054',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
  },
  btnCloseX: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  txtX: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  inputModal: {
    backgroundColor: '#FFF',
    width: '60%',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
  },
  btnOkModal: {
    backgroundColor: '#C44E04',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  btnOkModalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTextInfo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  codigoCard: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codigoText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  restanteFrase:{
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Zapfino',
    margin: 15,
  },
  botoesAcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  btnSortear: {
    backgroundColor: '#C44E04',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  btnSortearText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnDownload: {
    backgroundColor: '#2ECC71', // Verde de destaque para download
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnDownloadText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});