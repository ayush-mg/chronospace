import{useEffect,useRef}from"react";
import*as THREE from"three";
import{OrbitControls}from"three/examples/jsm/controls/OrbitControls.js";
export default function EarthGlobe(){
	const mountRef=useRef(null);
	useEffect(()=>{
		const currentMount=mountRef.current;
		const scene=new THREE.Scene();
		const camera=new THREE.PerspectiveCamera(75,currentMount.clientWidth/currentMount.clientHeight,0.1,1000);
		camera.position.z=5;
		scene.add(camera);
		const renderer=new THREE.WebGLRenderer({antialias:true});
		renderer.setSize(currentMount.clientWidth,currentMount.clientHeight);
		currentMount.appendChild(renderer.domElement);
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
		let animationFrameId;
		function animate(){
			animationFrameId=requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene,camera);
		}
		animate();
		return()=>{
			cancelAnimationFrame(animationFrameId);
			controls.dispose();
			renderer.dispose();
			currentMount.removeChild(renderer.domElement);
		};
	},[]);
	return <div ref={mountRef} style={{width:"100vw",height:"100vh"}}/>;
}