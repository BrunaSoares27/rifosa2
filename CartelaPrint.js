import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import GradeNumeros from './GradeNumeros';

const CartelaPrint = forwardRef(({ rifaAtiva }, ref) => {
  const dataSorteio = rifaAtiva?.dataSorteio || 'A definir';
  const numInicial = rifaAtiva?.numeroInicial || 1;
  const numFinal = rifaAtiva?.numeroFinal || 60;

  const numerosTotaisRifa = Array.from(
    { length: numFinal - numInicial + 1 },
    (_, i) => numInicial + i
  );
  const numerosVendidos = rifaAtiva?.numerosOcupados || [];

  return (
    <View style={styles.hiddenContainer} collapsable={false}>
      <ViewShot ref={ref} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.cardContainer}>
          <Text style={styles.tituloRifa}>{rifaAtiva?.tituloPremio || 'Rifa'}</Text>
          <Text style={styles.organizadorText}>
            Organizador: {rifaAtiva?.nomeProprietario || 'Anônimo'}
          </Text>

          {rifaAtiva?.fotoPremio && (
            <Image 
              source={{ uri: rifaAtiva.fotoPremio }} 
              style={styles.fotoPremio} 
            />
          )}

          {!rifaAtiva?.isFotoReal && (
            <Text style={styles.avisoFoto}>*Imagem ilustrativa</Text>
          )}

          {!!rifaAtiva?.descricao && (
            <View style={styles.obsBox}>
              <Text style={styles.obsText}>
                {rifaAtiva.descricao}
              </Text>
            </View>
          )}

          <Text style={styles.dataText}>Data do Sorteio: {dataSorteio}</Text>

          <View style={styles.gridContainer}>
            <GradeNumeros 
              numerosTotais={numerosTotaisRifa}
              numerosOcupados={numerosVendidos}
              numeroVencedor={rifaAtiva?.vencedor?.numero}
              interativo={false}
            />
          </View>

          <Text style={styles.rodapé}>Adquira já o seu número!</Text>
        </View>
      </ViewShot>
    </View>
  );
});

export default CartelaPrint;

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    left: -9999, // Mantém escondido fora da tela
  },
  cardContainer: {
    width: 350,
    backgroundColor: '#706054',
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#C44E04',
  },
  tituloRifa: {
    color: '#FF9754',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  organizadorText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 10,
  },
  fotoPremio: {
    width: 200,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  avisoFoto: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dataText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  gridContainer: {
    width: '100%',
    marginVertical: 10,
  },
  rodapé: {
    color: '#FFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
  },
  obsBox: {
    marginTop: 8,
    paddingHorizontal: 10,
    maxWidth: '90%',
  },
  obsText: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});