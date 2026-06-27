import{useEffect,useRef}from"react";
import*as THREE from"three";
import{OrbitControls}from"three/examples/jsm/controls/OrbitControls.js";
function latlongtovector(lat,lon,radius){
	const phi=(90-lat)*(Math.PI/180);
	const theta=(lon+180)*(Math.PI/180);
	const x=-(radius*Math.sin(phi)*Math.cos(theta));
	const z=(radius*Math.sin(phi)*Math.sin(theta));
	const y=(radius*Math.cos(phi));
	return new THREE.Vector3(x,y,z);
}
export default function EarthGlobe(){
	const mountref=useRef(null);
	useEffect(()=>{
		const currentmount=mountref.current;
		const scene=new THREE.Scene();
		const camera=new THREE.PerspectiveCamera(75,currentmount.clientWidth/currentmount.clientHeight,0.1,1000);
		camera.position.z=5;
		scene.add(camera);
		const renderer=new THREE.WebGLRenderer({antialias:true});
		renderer.setSize(currentmount.clientWidth,currentmount.clientHeight);
		currentmount.appendChild(renderer.domElement);
		const controls=new OrbitControls(camera,renderer.domElement);
		controls.enableDamping=true;
		controls.minDistance=2.2;
		controls.maxDistance=10;
		const ambientlight=new THREE.AmbientLight(0xffffff,0.1);
		scene.add(ambientlight);
		const sunlight=new THREE.DirectionalLight(0xffffff,1.5);
		sunlight.position.set(5,3,5);
		camera.add(sunlight);
		const textureloader=new THREE.TextureLoader();
		const colormap=textureloader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
		const bumpmap=textureloader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg");
		const shinymap=textureloader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg");
		const globeradius=2;
		const geometry=new THREE.SphereGeometry(globeradius,64,64);
		const material=new THREE.MeshPhongMaterial({map:colormap,normalMap:bumpmap,specularMap:shinymap,shininess:35});
		const earthglobe=new THREE.Mesh(geometry,material);
		scene.add(earthglobe);
		async function loadborders(){
			try{
				const response=await fetch("http://localhost:8000/boundaries/117");
				const data=await response.json();
				
				// Create a red 3D dot to mark coordinates clearly
				const beacongeom=new THREE.SphereGeometry(0.03,16,16);
				const beaconmat=new THREE.MeshBasicMaterial({color:0xff0000});
				
				data.features.forEach(feature=>{
					if(!feature.geometry||!feature.geometry.coordinates)return;
					const ismulti=feature.geometry.type==="MultiPolygon";
					const polygons=ismulti?feature.geometry.coordinates:[feature.geometry.coordinates];
					polygons.forEach(polygon=>{
						polygon.forEach(ring=>{
							ring.forEach(coord=>{
								if(Array.isArray(coord)){
									const vec=latlongtovector(coord[1],coord[0],globeradius+0.05);
									
									// Drop a 3D red dot exactly at this coordinate
									const beacon=new THREE.Mesh(beacongeom,beaconmat);
									beacon.position.copy(vec);
									earthglobe.add(beacon);
								}
							});
						});
					});
				});
			}catch(error){
				console.error("DRAWING ERROR:",error);
			}
		}
		loadborders();
		let animationframeid;
		function animate(){
			animationframeid=requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene,camera);
		}
		animate();
		return()=>{
			cancelAnimationFrame(animationframeid);
			controls.dispose();
			renderer.dispose();
			currentmount.removeChild(renderer.domElement);
		};
	},[]);
	return <div ref={mountref} style={{width:"100vw",height:"100vh"}}/>;
}