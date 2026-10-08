package com.apexfission.android.math.examples

import com.apexfission.android.math.models.*
import com.apexfission.android.math.transformations.translate

import com.apexfission.android.math.operations.toBox
import com.apexfission.android.math.operations.toPoint
import com.apexfission.android.math.transformations.toParentSpace
import com.apexfission.android.math.transformations.toChildSpace
import org.junit.Test

// docs:quickstart:start
fun viewportExample(): ImageBox {
    val source = ImageSpace(1920u, 1080u)
    val viewport = source.cropAtCenter(1080u, 1080u)
    val sourceBox = ImageBox.from2P(500u, 100u, 1000u, 600u)
    return sourceBox.translate(source.chain(viewport))
    // ImageBox(x=80, y=100, x2=580, y2=600, width=500, height=500)
}
// docs:quickstart:end


fun runDocumentationExamples() {
    val cropBox = viewportExample()
    check(cropBox == ImageBox.from2P(80u, 100u, 580u, 600u))
    val source = ImageSpace(1920u, 1080u)
    val crop = source.cropAtCenter(1080u, 1080u)
    check(cropBox.translate(crop.chain(source, SpaceRelationship.Parent)) == ImageBox.from2P(500u, 100u, 1000u, 600u))
    val detection = NormImageBox.from2P(0.25f, 0.25f, 0.75f, 0.75f)
    check(detection.toParentSpace(parentSpace = source, childSpace = crop) == ImageBox.from2P(690u, 270u, 1230u, 810u))
    val parent = ImageSpace(200u, 100u)
    val child = parent.crop(100u, 100u, 50u, 0u)
    val normalized = NormImagePoint(0.5f, 0.5f)
    check(normalized.toPoint(parent).toChildSpace(parent, child) == ImagePoint(50u, 50u))
    check(normalized.toChildSpace(parent, child) == ImagePoint(0u, 50u))
    val small = ImageSpace(3u, 3u)
    check(normalized.toPoint(small) == ImagePoint(1u, 1u))
    check(NormImageBox.from2P(0.5f, 0.5f, 1f, 1f).toBox(small) == ImageBox.from2P(2u, 2u, 3u, 3u))
    check(ImagePoint(0u, 50u).toChildSpace(parent, child) == ImagePoint(0u, 50u))
    check(ImageSpace(100u, 100u).scale(0.5f).width == 50u)
    check(ImageBox.fromPS(1, 2, 3, 4).offset(-2, 0) == ImageBox.from2P(0, 2, 2, 6))
    println("PASS: viewport=$cropBox; detector=(690,270)-(1230,810); source-normalized=(50,50); helper=(0,50); rounding and clipping verified")
}

class DocumentationExamplesTest {
    @Test fun documentedScenarios() = runDocumentationExamples()
}

fun main() = runDocumentationExamples()
