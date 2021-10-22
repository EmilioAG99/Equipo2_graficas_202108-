# Equipo2_graficas_202108
# Descripción de Requerimientos y Aspectos a ser incluidos en Map Generator
## Archivos pesados con LFS por si no cargan los modelos, la entrega esta en la carpeta de ProyectoFinal_PrimerAvance y los modelos se encuentran en modelos.js y modelos.html  

## Integrantes
Andrés Barragán Salas - *A01026567*  
Luis Emilio Alcántara Guzman - *A01027304*  
Esteban Manrique de Lara Sirvent - *A01027077*  

## Proyecto a realizar

El proyecto consistirá en desarrollar un mapa 3D interactivo que permita a los usuarios explorar partes del mapa haciendo “drag-and-drop” y hacer clicks en lugares en especifico para ver detalles de las ubicaciones. El estilo de dibujo aplicado al mapa será parecido a aquel de un dibujo hecho a lápiz, utilizará componentes que se repetirán dependiendo el tipo de zona, por ejemplo, árboles, casas, edificios, sembradíos, entre otros, todo lo anterior con un estilo medieval. Entre las posibles aplicaciones de este proyecto puede ser la aplicación interactiva en los juegos de rol como lo puede ser Dungeons & Dragons, de manera que esta herramienta ayude a los jugadores a visualizar el escenario en el que se encuentran. Atendiendo a lo anterior, una funcionalidad adicional a la cual se podría apuntar con el proyecto es un modo “creación” que proporcione a los usuarios la opción de generar un mapa desde cero haciendo uso de los componentes existentes o incluso la generación de mapas aleatorios y/o dinámicos.

## Características del proyecto  
### Flujo de la aplicación  
<p align="center">
  <img width="600" height="300" src="https://raw.githubusercontent.com/EmilioAG99/Equipo2_graficas_202108-/main/images/flujo.png">
</p>  
El usuario será presentado con una pantalla principal al ingresar a la aplicación, en ella se mostrará un menú con las siguientes opciones: “Nuevo mapa”, “Abrir un mapa” y “Ajustes”. Cuando el usuario elija la opción de abrir un nuevo mapa entonces se le preguntará si desea generar un nuevo mapa aleatoriamente o crear uno desde cero. Cada una de las opciones anteriores redirigirá a una vista diferente, ya sea a un modo exploración o un modo de creación de un mapa. Al intentar abrir un mapa, el usuario podrá acceder a los mapas creados localmente (en el mismo ordenador) o la opción de subir un archivo de texto para obtener otro mapa. Por último, al acceder a los ajustes de la página, los usuarios podrán acceder a la miscelánea del proyecto, incluyendo los créditos y opciones de video y audio.  

### Tiles
<p align="center">
  <img width="600" height="300" src="https://raw.githubusercontent.com/EmilioAG99/Equipo2_graficas_202108-/main/images/tiles.png">
</p>
Cada una de los tiles/casillas de los mapas tendrán forma de hexágono. De esta manera, cada uno de ellos estará directamente a otros seis hexágonos distintos, permitiendo que el movimiento a lo largo del tablero sea sencillo y rápido para el usuario. Asimismo, con este diseño en mente, se podrá configurar de manera más detallada condiciones en la generación de biomas y conjuntos de tiles en el tablero; similar a lo presentado en juegos como Civilization 6 o Age of Empires, habrá condiciones en la generación de los mapas para evitar qué biomas/personajes opuestos y contradictorios queden juntos. Debido a la naturaleza del proyecto, no se podrá aplicar la otra gran ventaja de tableros compuestos por hexágonos: bonificaciones/mejoras por adyacencia entre los hexágonos.  

<p align="center">
  <img width="600" height="300" src="https://raw.githubusercontent.com/EmilioAG99/Equipo2_graficas_202108-/main/images/Civ6.png">
</p>  
En cuanto a la vista/cámara qué el usuario, se espera que tenga un ángulo de inclinación de 45°, como en la imagen proporcionada como ejemplo. De esta manera, no se tiene una perspectiva de “ojo de Dios”, que evitaría qué el usuario pudiera percibir los diferentes detalles de personajes, estructuras y paisajes en el mapa.  

Listado de elementos en los Tiles a ser encontrados:  
* Biomas:
  * Bosque (árboles, pasto, casas)
  * Ríos (puentes para cruzar)
  * Sembradíos (casas, tiendas, cosechas, aldeanos)
  * Lago (patitos de hule)
  * Pantano (cocodrilos, orcos)
  * Desierto (iguanas, pirámides)
  * Planicies (castillos y fortalezas)
* Personajes:  
  * Aldeanos
  * Duendes
  * Dragones
  * Caballeros
  * Hechizeros
  * Orcos
  * Lobos
  * Patitos de hule
  * Cocodrilos
  * Iguana
* Estructuras
  * Casas
  * Castillos
  * Tiendas
  * Fortaleza
  * Puente
  * Pirámides  

<p align="center">
  <img width="600" height="300" src="https://raw.githubusercontent.com/EmilioAG99/Equipo2_graficas_202108-/main/images/mapa.png">
</p> 

## Generación de mapas  
La opción de la aplicación para generar nuevos mapas será conformada por las siguientes dos opciones:  
* Modo creación de mapa: los usuarios tendrán la posibilidad de acceder a un modo creación para la generación de un nuevo mapa. En se presentará al usuario con un mapa vacío en donde se mostrarán los tiles (o hexágonos) en blanco y la opción para seleccionar uno o varios de ellos para posteriormente ser poblados con un tipo de tile disponible en el juego. 
* Generación aleatoria: la otra opción presentada al usuario será la generación de un mapa aleatorio. En ella un algoritmo se encargará de la generación automática y distribuida del mapa, únicamente redirigiendo al usuario directamente al modo de exploración de un mapa.

### Almacenamiento de mapas  
Los mapas generados ya sean de manera aleatoria o en el modo creador podrán ser guardados para posteriormente ser reusados. Los mapas podrán ser guardados en el local storage para que en otro momento se pueda seleccionar y que sea cargado o puede ser guardado en un archivo de texto que posteriormente puede ser importado y se generará todo lo que se tenía hasta el momento de la exportación del mapa. Una vez que se haya cargado el mapa de cualquiera de los dos métodos antes mencionados se podrá explorar el mapa como se hace al tener un inicial. 

### Restricciones para creación de mapa  
* Bosque : La posición puede ser en cualquier hexágono excepto a lado de un desierto
  * Árboles  
  * Pasto
  * Casas
  * Lobos
* Ríos: Debe de estar a lado de un bosque o planicie
  * Puente
  * Pato de hule
* Sembradíos: Debe de estar a lado de un bosque o planicie  
  * Casas
  * Tiendas
  * Cosechas
  * Aldeanos
  * Caballeros 
* Lago: Debe de estar a lado de un bosque o planicie  
  * Puente
  * Pato de hule
* Pantano: Debe de estar a lado de un bosque
  * Cocodrilos
  * Orcos
  * Árboles
* Desierto: Únicamente puede encontrarse a un lado de una planicie
  * Iguanas
  * Pirámides
  * Fortaleza
* Planicies: Puede ocupar cualquier lugar en los hexágonos
  * Castillos 
  * Fortalezas
  * Dragones
  * Caballeros 
  * Hechizeros
